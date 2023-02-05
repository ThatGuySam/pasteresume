import { expect, test } from 'vitest'
import { buildQuery } from '~/utils/queries'

test( 'Can test', async () => {
    expect( test ).toBeTruthy()
} )

test( 'Can build query for remote designer jobs', () => {
    const queryParts = [
        {
            type: 'text',
            value: 'remote designer',
        },
        {
            type: 'site',
            value: 'greenhouse.io',
        },
    ]

    expect( buildQuery( queryParts ) )
        .toBe( 'remote designer site:greenhouse.io' )
} )
