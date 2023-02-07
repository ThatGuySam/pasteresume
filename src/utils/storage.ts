import { createStorage } from 'unstorage'
import { v5 as uuidv5 } from 'uuid'
import { parseQuery } from '~/utils/queries'

// Changing this value can wipe out all local user storage
// so change at your own peril
const queriesBase = 'queries'
const UUID_NAMESPACE = '1a3cbda5-7c19-408d-ac04-9d0559a6cc28'

let storage: ReturnType<typeof createStorage>

export async function getStorage () {
    if ( storage ) {
        return storage
    }

    const {
        default: localStorageDriver,
    } = await import( 'unstorage/drivers/localstorage' )

    const defaultStorage = createStorage( {
        // @ts-expect-error: Error from inline import
        driver: localStorageDriver( {
            base: queriesBase,
        } ),
    } )

    storage = defaultStorage

    return defaultStorage
}

export interface StoredQuery {
    text: string
    date: number
}

export interface StoredQueryOptions extends Partial<StoredQuery> {
    text: string
}

function derriveUUIDFromQuery ( query: string ) {
    const queryPartsJSON = JSON.stringify( parseQuery( query ) )

    return uuidv5( queryPartsJSON, UUID_NAMESPACE )
}

export async function getQueryKeys (): Promise<Array<string>> {
    const storage = await getStorage()

    const queryKeys = await storage.getKeys( queriesBase )

    return queryKeys
}

export async function getQueries (): Promise<StoredQuery[]> {
    const storage = await getStorage()

    const queryKeys = await getQueryKeys()

    const unsortedQueries = await Promise.all( queryKeys.map( ( key ) => {
        // We have to omit the base key from the key name
        // since we're already on Query storage
        const queryUUID = key.replace( `${ queriesBase }:`, '' )

        return storage.getItem( queryUUID ) as Promise<StoredQuery>
    } ) )

    const queries = unsortedQueries
        // Sort by date
        .sort( ( a, b ) => {
            if ( a.date > b.date ) {
                return -1
            }
            if ( a.date < b.date ) {
                return 1
            }
            return 0
        } )

    return queries
}

export async function storeQuery ( query: StoredQueryOptions ): Promise<StoredQuery> {
    const storage = await getStorage()

    // Set the date to now if it's not set
    const storedQuery: StoredQuery = {
        ...query,
        date: query.date || Date.now(),
    }

    const key = derriveUUIDFromQuery( storedQuery.text )

    await storage.setItem( key, storedQuery )

    return storedQuery
}

export async function watchQueries ( callback: ( queries: any ) => void ): Promise<ReturnType<typeof storage.watch>> {
    const storage = await getStorage()

    // console.log( { callback } )

    return await storage.watch( callback )
}
