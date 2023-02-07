import { expect, test } from 'vitest'
import type { QueryPart } from '~/utils/queries'
import {
    buildQuery,
    getQueryParts,
    getVariations,
    makeGoogleSearchUrl,
    parseQuery,
} from '~/utils/queries'

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
        .toBe( 'remote marketing site:greenhouse.io after:2023-01-01' )

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
        .toBe( 'remote marketing site:greenhouse.io after:2022-12-01' )

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
        .toBe( 'remote designer ( site:greenhouse.io OR site:breezy.hr OR site:jobs.lever.co OR site:apply.workable.com OR site:bamboohr.com )' )

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
    const febQuery = 'remote marketing site:jobs.io after:2023-02-01'

    const variations = getVariations( febQuery )

    expect( variations )
        .toEqual( expect.arrayContaining( [
            {
                label: 'January, 2023',
                query: 'remote marketing site:jobs.io before:2023-02-01 after:2023-01-01',
            },
            {
                label: 'December, 2022',
                query: 'remote marketing site:jobs.io before:2023-01-01 after:2022-12-01',
            },
            {
                label: 'November, 2022',
                query: 'remote marketing site:jobs.io before:2022-12-01 after:2022-11-01',
            },
            {
                label: 'October, 2022',
                query: 'remote marketing site:jobs.io before:2022-11-01 after:2022-10-01',
            },
            {
                label: 'September, 2022',
                query: 'remote marketing site:jobs.io before:2022-10-01 after:2022-09-01',
            },
            {
                label: 'August, 2022',
                query: 'remote marketing site:jobs.io before:2022-09-01 after:2022-08-01',
            },
            {
                label: 'July, 2022',
                query: 'remote marketing site:jobs.io before:2022-08-01 after:2022-07-01',
            },
            {
                label: 'June, 2022',
                query: 'remote marketing site:jobs.io before:2022-07-01 after:2022-06-01',
            },
            {
                label: 'May, 2022',
                query: 'remote marketing site:jobs.io before:2022-06-01 after:2022-05-01',
            },
            {
                label: 'April, 2022',
                query: 'remote marketing site:jobs.io before:2022-05-01 after:2022-04-01',
            },
            {
                label: 'March, 2022',
                query: 'remote marketing site:jobs.io before:2022-04-01 after:2022-03-01',
            },
            {
                label: 'February, 2022',
                query: 'remote marketing site:jobs.io before:2022-03-01 after:2022-02-01',
            },
        ] ) )
} )

test( 'Can make Google Search URL from query text', () => {
    const query = 'Marketing Remote Health Insurance 70000..250000 ( site:greenhouse.io OR site:breezy.hr OR site:lever.co OR site:apply.workable.com OR site:bamboohr.com OR site:jobs.lever.co ) before:2023-01 after:2022-12'
    const expectedUrl = new URL( 'https://www.google.com/search?q=Marketing+Remote+Health+Insurance+70000..250000+(+site%3Agreenhouse.io+OR+site%3Abreezy.hr+OR+site%3Alever.co+OR+site%3Aapply.workable.com+OR+site%3Abamboohr.com+OR+site%3Ajobs.lever.co+)+before%3A2023-01+after%3A2022-12' )

    // Expect search string to match
    expect( makeGoogleSearchUrl( query ).search )
        .toEqual( expectedUrl.search )

    // Expect href to match
    expect( makeGoogleSearchUrl( query ).href )
        .toEqual( expectedUrl.href )
} )

test( 'Can get query parts object', () => {
    const query = 'Marketing Remote Health Insurance 70000..250000 ( site:greenhouse.io OR site:breezy.hr OR site:jobs.lever.co OR site:apply.workable.com OR site:bamboohr.com ) before:2023-01 after:2022-12'

    const expectedParts = {
        terms: 'Marketing Remote Health Insurance',
        salary: [ 70000, 250000 ],
        sites: [
            'greenhouse.io',
            'breezy.hr',
            'jobs.lever.co',
            'apply.workable.com',
            'bamboohr.com',
        ],
        // before: '2023-01',
        // after: '2022-12',
    }

    expect( getQueryParts( query ) )
        .toEqual( expectedParts )
} )
