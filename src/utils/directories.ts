import path from 'path'
import { fileURLToPath } from 'url'

const __vitedirname = path.dirname( fileURLToPath( import.meta.url ) )

/** */
export const getProjectRootDir = (): string => {
    const mode = import.meta.env.MODE

    return mode === 'production' ? path.join( __vitedirname, '../' ) : path.join( __vitedirname, '../../' )
}

const __srcFolder = path.join( getProjectRootDir(), '/src' )

/** */
export const getRelativeUrlByFilePath = ( filepath: string ): string => {
    return filepath.replace( __srcFolder, '' )
}
