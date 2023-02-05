import * as chrono from 'chrono-node'

export interface QueryPart {
    type: string
    input?: string
}

function parseLastMonthFromString ( dateString?: string ): string {
    const date = chrono.parseDate( dateString || '' )
    // Let's rewind the clocks back to last month
    date.setMonth( date.getMonth() - 1 )

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString = String( month ).padStart( 2, '0' )

    return `${ year }-${ monthString }`
}

export function buildQuery ( queryParts: QueryPart[] ): string {
    return queryParts
        .map( ( part ) => {
            switch ( part.type ) {
                case 'text':
                    return part.input

                case 'site':
                    return `site:${ part.input }`

                case 'last-month':
                    return `after:${ parseLastMonthFromString( part?.input ) }`

                default:
                    throw new Error( `Unknown query part type: ${ part.type }` )
            }
        } )
        .join( ' ' )
}
