export interface QueryPart {
    type: string
    value: string
}

export function buildQuery ( queryParts: QueryPart[] ): string {
    return queryParts
        .map( ( part ) => {
            switch ( part.type ) {
                case 'text':
                    return part.value

                case 'site':
                    return `site:${ part.value }`

                default:
                    return ''
            }
        } )
        .join( ' ' )
}
