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

function parseLastMonthFromString ( dateString?: QueryPart['input'] ): string {
    const inputDate = chrono.parseDate( String( dateString ) ) || new Date()

    // Let's rewind the clocks back to last month
    const dateOfLastMonth = new Date( inputDate.getFullYear(), inputDate.getMonth() - 1, 1 )

    const year = dateOfLastMonth.getFullYear()
    const month = dateOfLastMonth.getMonth() + 1
    const monthString = String( month ).padStart( 2, '0' )

    return `${ year }-${ monthString }`
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
