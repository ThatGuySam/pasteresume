import { expect, test } from 'vitest'
import { buildQuery } from '~/utils/queries'

test( 'Can test', async () => {
    expect( test ).toBeTruthy()
} )

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

test( 'Can all hr sites when not set', () => {
    const queryParts = [
        {
            type: 'text',
            input: 'remote designer',
        },
    ]

    expect( buildQuery( queryParts ) )
        .toBe( 'remote designer ( site:greenhouse.io OR site:breezy.hr OR site:lever.co OR site:apply.workable.com OR site:bamboohr.com OR site:jobs.lever.co )' )
} )

test( 'Can set salary range', () => {
    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'salary',
            input: [ 100_000, 200_000 ],
        },
    ] ) )
        .toContain( '100000..200000' )

    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'salary',
            input: [ 100_000 ],
        },
    ] ) )
        .toContain( '100000..' )

    // Expect any max value over 900k to throw
    expect( () => buildQuery( [
        ...remoteMarketing,
        {
            type: 'salary',
            input: [ 100_000, 1_000_000 ],
        },
    ] ) )
        .toThrow()
} )
