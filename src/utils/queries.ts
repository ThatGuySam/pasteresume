import * as chrono from 'chrono-node'

export interface QueryPart {
    type: string
    input?: string | number[]
}

const hrSites = [
    'greenhouse.io',
    'breezy.hr',
    'lever.co',
    'apply.workable.com',
    'bamboohr.com',
    'jobs.lever.co',
]

function shiftMonth ( date: Date, months: number ): Date {
    return new Date( date.getFullYear(), date.getMonth() + months, 1 )
}

function parseDateFromString ( dateString?: QueryPart['input'] ): Date {
    return chrono.parseDate( String( dateString ) ) || new Date()
}
function parseLastMonthDateFromString ( dateString?: QueryPart['input'] ): Date {
    const inputDate = parseDateFromString( dateString )

    // Let's rewind the clocks back to last month
    return shiftMonth( inputDate, -1 )
}

function formatForDateOperator ( date: Date ): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString = String( month ).padStart( 2, '0' )

    return `${ year }-${ monthString }-01`
}

function parseLastMonthFromString ( dateString?: QueryPart['input'] ): string {
    const dateOfLastMonth = parseLastMonthDateFromString( dateString )

    return formatForDateOperator( dateOfLastMonth )
}

function handleSite ( part: QueryPart ): string {
    // Throw on non-string input
    if ( typeof part.input !== 'string' ) {
        throw new TypeError( `Expected string input for site query part, got ${ typeof part.input }` )
    }

    // Using OR operator does work when combined with the inurl operator
    // so for now we'll just use leave out the inurl operator
    return `site:${ part.input }`

    // switch ( part.input ) {
    //     case 'greenhouse.io':
    //         return `site:${ part.input } inurl:jobs`

    //     case 'breezy.hr':
    //         return `site:${ part.input } inurl:/p/`

    //     case 'lever.co':
    //         return `site:${ part.input }`

    //     case 'apply.workable.com':
    //         return `site:${ part.input }`

    //     case 'bamboohr.com':
    //         return `site:${ part.input }`

    //     case 'jobs.lever.co':
    //         return `site:${ part.input }`

    //     default:
    //         throw new Error( `Unknown query part type: ${ part.type }` )
    // }
}

function handleSalary ( input: QueryPart['input'] ): string {
    // Throw on non-array input
    if ( !Array.isArray( input ) ) {
        throw new TypeError( `Expected array input for salary query part, got ${ typeof input }` )
    }

    // Throw on second value being greater than 900k
    if ( input[ 1 ] && input[ 1 ] > 900_000 ) {
        throw new Error( 'Salary range cannot be greater than $900k since that can cause it to match against non-salary numbers' )
    }

    // Join the array with ensuring that we always have three dots
    return `${ input[ 0 ] }..${ input[ 1 ] || '' }`
}

function handlePart ( part: QueryPart ): string {
    switch ( part.type ) {
        case 'text':
            // Throw on non-string input
            if ( typeof part.input !== 'string' ) {
                throw new TypeError( `Expected string input for text query part, got ${ typeof part.input }` )
            }
            return part.input

        case 'site':
            return handleSite( part )

        case 'last-month':
            return `after:${ parseLastMonthFromString( part?.input ) }`

        case 'salary':
            return handleSalary( part.input )

        default:
            throw new Error( `Unknown query part type: ${ part.type }` )
    }
}

export function buildQuery ( inputQueryParts: QueryPart[] ): string {
    const queryParts: string[] = []

    for ( const part of inputQueryParts ) {
        queryParts.push( handlePart( part ) )
    }

    // Find first site
    const firstSiteIndex = queryParts.findIndex( ( partString ) => {
        for ( const site of hrSites ) {
            if ( partString.includes( site ) ) {
                return true
            }
        }
    } )

    // If we don't have any hr sites, let's add all of them
    if ( firstSiteIndex === -1 ) {
        const sitesString = hrSites.map( ( site ) => {
            return handleSite( { type: 'site', input: site } )
        } ).join( ' OR ' )

        queryParts
            .push( `( ${ sitesString } )` )
    }

    return queryParts
        .map( string => string.trim() )
        .join( ' ' )
}

function parseAfter ( part: string ): QueryPart {
    return {
        type: 'last-month',
        input: part,
    }
}

function parseBefore ( part: string ): QueryPart {
    return {
        type: 'before',
        input: part,
    }
}

const ignoredQueryParts = new Set( [
    '(',
    ')',
    'OR',
    'AND',
] )

function parseQueryPart ( part: string ): QueryPart | undefined {
    // Retunr undefined for parentheses
    if ( ignoredQueryParts.has( part ) ) {
        return undefined
    }

    // If there's 2 periods, it's a salary query part
    if ( part.includes( '..' ) ) {
        return {
            type: 'salary',
            input: part.split( '..' ).map( number => Number( number ) ),
        }
    }

    // If there's no colon, it's a text query part
    if ( !part.includes( ':' ) ) {
        return {
            type: 'text',
            input: part,
        }
    }

    // Split the part into type and input
    const [ type, input ] = part.split( ':' )

    switch ( type ) {
        case 'after':
            return parseAfter( input )

        case 'before':
            return parseBefore( input )

        case 'site':
            return { type, input }

        default:
            throw new Error( `Unknown query part: ${ part }` )
    }
}

// Since we derrived UUIDs from this sort order
// we treat it as immutable and don't change it
// so that we don't wipe out all the existing UUIDs references
//
// Sort by type then input
function querySortAlpha ( a: QueryPart, b: QueryPart ) {
    // Text parts always come first
    if ( a.type === 'text' && b.type !== 'text' ) {
        return -1
    }

    // Then salary parts
    if ( a.type === 'salary' && b.type !== 'salary' ) {
        return -1
    }

    // Then operators that contain colons go last
    if ( a.type.includes( ':' ) && b.type.includes( ':' ) ) {
        // Throw on non-string inputs
        if ( typeof a.input !== 'string' || typeof b.input !== 'string' ) {
            throw new TypeError( `Expected string input for text query part, got ${ typeof a.input } and ${ typeof b.input }` )
        }

        // Sorted by input alphabetically
        return a.input.localeCompare( b.input )
    }

    return 0
}

export function parseQuery ( query: string ): QueryPart[] {
    const queryParts: QueryPart[] = []

    const parts = query.split( ' ' )

    for ( const part of parts ) {
        const parsedPart = parseQueryPart( part )

        if ( parsedPart ) {
            queryParts.push( parsedPart )
        }
    }

    return queryParts
        .sort( querySortAlpha )
}

function setOperator ( query: string, operators: {
    [ key: string ]: string
} ) {
    for ( const [ key, value ] of Object.entries( operators ) ) {
        // If the query already has the operator, replace it
        if ( query.includes( `${ key }:` ) ) {
            query = query.replace( new RegExp( `${ key }:.*?\\s` ), `${ key }:${ value } ` )
            continue
        }

        // Otherwise, add it
        query += ` ${ key }:${ value }`
    }

    return query
}

export interface Variation {
    label: string
    query: string
}

// Parse a query string into an array of variations
export function getVariations ( query: string ): Variation[] {
    // Build variations for the previous 12 months
    const variations: Variation[] = []

    // Get intial date in query or use last month
    const initialDate = parseDateFromString( query )

    // Get query sans before and after operators
    const queryWithoutDates = query
        .split( ' ' )
        .filter( part => !part.includes( 'before:' ) && !part.includes( 'after:' ) )
        .join( ' ' )

    let runningDate = initialDate

    for ( let i = 0; i < 12; i++ ) {
        const before = formatForDateOperator( runningDate )
        const afterDate = shiftMonth( runningDate, -1 )
        const after = formatForDateOperator( afterDate )

        // Add variation to variations
        variations.push( {
            label: `${ afterDate.toLocaleString( 'default', { month: 'long' } ) }, ${ afterDate.getFullYear() }`,
            query: setOperator( queryWithoutDates, {
                before,
                after,
            } ),
        } )

        // Shift date back one month
        runningDate = shiftMonth( runningDate, -1 )
    }

    return variations
}

export function makeGoogleSearchUrl ( query: string ) {
    const urlString = `https://www.google.com/search?q=${ encodeURIComponent( query ) }`
        // Convert %20 to + to match Google's query format
        .replace( /%20/g, '+' )

    return new URL( urlString )
}

export function getQueryParts ( query: string ): {
    terms: string
    salary: number[]
    sites: string[]

} {
    const queryParts = parseQuery( query )

    const terms: string[] = []
    const salary: number[] = []
    const sites: string[] = []

    for ( const part of queryParts ) {
        // If input is falsy, skip it
        if ( !part.input ) {
            continue
        }

        switch ( part.type ) {
            case 'text':
                // Throw on non-string inputs
                if ( typeof part.input !== 'string' ) {
                    throw new TypeError( `Expected string input for text query part, got ${ typeof part.input }` )
                }
                terms.push( part.input )
                break

            case 'salary':
                // Throw on non-number inputs
                if ( !Array.isArray( part?.input ) || typeof part?.input?.[ 0 ] !== 'number' ) {
                    throw new TypeError( `Expected number input for salary query part, got ${ typeof part?.input?.[ 0 ] }` )
                }
                salary.push( ...part.input )
                break

            case 'site':
                // Throw on non-string inputs
                if ( typeof part.input !== 'string' ) {
                    throw new TypeError( `Expected string input for site query part, got ${ typeof part.input }` )
                }
                sites.push( part.input )
                break
        }
    }

    return {
        terms: terms.join( ' ' ),
        salary,
        sites,
    }
}
