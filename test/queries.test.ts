import { expect, test } from 'vitest'
import type { QueryPart } from '~/utils/queries'
import { buildQuery, getVariations, parseQuery } from '~/utils/queries'

test( 'Can test', async () => {
    expect( test ).toBeTruthy()
} )

const remoteMarketing = [
    {
        type: 'text',
        input: 'remote',
    },
    {
        type: 'text',
        input: 'marketing',
    },
    {
        type: 'site',
        input: 'greenhouse.io',
    },
]

function expectMatchingTypes ( parts: QueryPart[] ) {
    return expect.arrayContaining(
        parts.map( part => (
            expect.objectContaining( {
                type: part.type,
            } )
        ) ),
    )
}

test( 'Can build for remote designer jobs', () => {
    const remoteDeigner = [
        {
            type: 'text',
            input: 'remote',
        },
        {
            type: 'text',
            input: 'designer',
        },
        {
            type: 'site',
            input: 'greenhouse.io',
        },
    ]

    const remoteDeignerQuery = buildQuery( remoteDeigner )

    expect( remoteDeignerQuery )
        .toBe( 'remote designer site:greenhouse.io' )

    const parsed = parseQuery( remoteDeignerQuery )

    expect( parsed )
        .toEqual( remoteDeigner )
} )

test( 'Can build for remote marketing jobs from the past month', () => {
    const febQueryParts = [
        ...remoteMarketing,
        {
            type: 'last-month',
            input: 'February, 2023',
        },
    ]

    const febQuery = buildQuery( febQueryParts )

    expect( febQuery )
        .toBe( 'remote marketing site:greenhouse.io after:2023-01' )

    // Expect that parsed query is the same as the original
    expect( parseQuery( febQuery ) )
        .toEqual( expectMatchingTypes( febQueryParts ) )

    const janQueryParts = [
        ...remoteMarketing,
        {
            type: 'last-month',
            input: 'January, 2023',
        },
    ]

    const janQuery = buildQuery( janQueryParts )

    expect( janQuery )
        .toBe( 'remote marketing site:greenhouse.io after:2022-12' )

    // Expect that parsed query is the similar to the original
    expect( parseQuery( janQuery ) )
        .toEqual( expectMatchingTypes( janQueryParts ) )

    // Check that no input is truthy and doesn't throw
    expect( buildQuery( [
        ...remoteMarketing,
        {
            type: 'last-month',
        },
    ] ) )
        .toBeTruthy()
} )

test( 'Can all hr sites when not set', () => {
    const designerQueryParts = [
        {
            type: 'text',
            input: 'remote designer',
        },
    ]

    const designerQuery = buildQuery( designerQueryParts )

    expect( designerQuery )
        .toBe( 'remote designer ( site:greenhouse.io OR site:breezy.hr OR site:lever.co OR site:apply.workable.com OR site:bamboohr.com OR site:jobs.lever.co )' )

    // Expect that parsed query is the similar to the original
    expect( parseQuery( designerQuery ) )
        .toEqual( expectMatchingTypes( designerQueryParts ) )
} )

test( 'Can set salary range', () => {
    const salaryQueryParts = [
        ...remoteMarketing,
        {
            type: 'salary',
            input: [ 100_000, 200_000 ],
        },
    ]

    const salaryQuery = buildQuery( salaryQueryParts )

    expect( salaryQuery )
        .toContain( '100000..200000' )

    // Expect that parsed query is the similar to the original
    expect( parseQuery( salaryQuery ) )
        .toEqual( expectMatchingTypes( salaryQueryParts ) )

    const minSalaryQueryParts = [
        ...remoteMarketing,
        {
            type: 'salary',
            input: [ 100_000 ],
        },
    ]

    const minSalaryQuery = buildQuery( minSalaryQueryParts )

    expect( minSalaryQuery )
        .toContain( '100000..' )

    // Expect that parsed query is the similar to the original

    expect( parseQuery( minSalaryQuery ) )
        .toEqual( expectMatchingTypes( minSalaryQueryParts ) )

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

test( 'Can get date variations from query', () => {
    // Build query to get variations
    const febQuery = 'remote marketing site:greenhouse.io after:2023-01'

    const variations = getVariations( febQuery )

    expect( variations )
        .toEqual( expect.arrayContaining( [
            'remote marketing site:greenhouse.io before:2023-01 after:2022-12',
            'remote marketing site:greenhouse.io before:2022-12 after:2022-11',
            'remote marketing site:greenhouse.io before:2022-11 after:2022-10',
            'remote marketing site:greenhouse.io before:2022-10 after:2022-09',
            'remote marketing site:greenhouse.io before:2022-09 after:2022-08',
            'remote marketing site:greenhouse.io before:2022-08 after:2022-07',
            'remote marketing site:greenhouse.io before:2022-07 after:2022-06',
            'remote marketing site:greenhouse.io before:2022-06 after:2022-05',
            'remote marketing site:greenhouse.io before:2022-05 after:2022-04',
            'remote marketing site:greenhouse.io before:2022-04 after:2022-03',
            'remote marketing site:greenhouse.io before:2022-03 after:2022-02',
        ] ) )
} )
