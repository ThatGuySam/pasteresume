import { expect, test } from 'vitest'
import { buildQuery } from '~/utils/queries'

test( 'Can test', async () => {
    expect( test ).toBeTruthy()
} )

test( 'Can build for remote designer jobs', () => {
    const queryParts = [
        {
            type: 'text',
            input: 'remote designer',
        },
        {
            type: 'site',
            input: 'greenhouse.io',
        },
    ]

    expect( buildQuery( queryParts ) )
        .toBe( 'remote designer site:greenhouse.io' )
} )

test( 'Can build for remote marketing jobs from the past month', () => {
    const remoteMarketing = [
        {
            type: 'text',
            input: 'remote marketing',
        },
        {
            type: 'site',
            input: 'greenhouse.io',
        },
    ]

    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'last-month',
            input: 'February, 2023',
        },
    ] ) )
        .toBe( 'remote marketing site:greenhouse.io after:2023-01' )

    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'last-month',
            input: 'January, 2023',
        },
    ] ) )
        .toBe( 'remote marketing site:greenhouse.io after:2022-12' )

    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'last-month',
        },
    ] ) )
        .toBeTruthy()
} )
