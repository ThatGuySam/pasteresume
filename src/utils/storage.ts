import { createStorage } from 'unstorage'
import { v5 as uuidv5 } from 'uuid'
import { parseQuery } from '~/utils/queries'

// Changing this value can wipe out all local user storage
// so change at your own peril
const base = 'app:'
const queriesBase = 'queries:'
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
            base,
        } ),
    } )

    storage = defaultStorage

    return defaultStorage
}

export interface StoredQuery {
    text: string
    date?: number
}

function derriveUUIDFromQuery ( query: string ) {
    const queryPartsJSON = JSON.stringify( parseQuery( query ) )

    return uuidv5( queryPartsJSON, UUID_NAMESPACE )
}

export async function getQueryKeys (): Promise<Array<string>> {
    const storage = await getStorage()

    const queryKeys = await storage.getKeys( base + queriesBase )

    return queryKeys
}

export async function getQueries (): Promise<StoredQuery[]> {
    const storage = await getStorage()

    const queryKeys = await getQueryKeys()

    console.log( { queryKeys } )

    const queries = await Promise.all( queryKeys.map( key => storage.getItem( key ) ) )

    return queries as Array<StoredQuery>
}

export async function storeQuery ( query: StoredQuery ): Promise<StoredQuery> {
    const storage = await getStorage()

    // Set the date to now if it's not set
    query.date = Date.now()

    const key = `${ queriesBase }${ derriveUUIDFromQuery( query.text ) }`

    await storage.setItem( key, query )

    return query
}

export async function watchQueries ( callback: ( queries: any ) => void ): Promise<ReturnType<typeof storage.watch>> {
    const storage = await getStorage()

    // console.log( { callback } )

    return await storage.watch( callback )
}
