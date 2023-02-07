<template>
    <div class="wrapper flex justify-center">
        <div
            class="container max-w-sm border p-6" :class="[
                !loaded && 'shimmer',
            ]"
        >
            <div v-if="loaded">
                <div v-if="!hasAnyStoredQueries || showForm">
                    <form
                        class="isolate -space-y-px rounded-md shadow-sm"
                        @submit.prevent="handleSubmit"
                    >
                        <div class="relative rounded-md rounded-b-none border border-gray-300 px-3 py-2 focus-within:z-10 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                            <label for="name" class="block text-xs font-medium opacity-75">Terms</label>
                            <input
                                id="terms"
                                v-model="options.terms"
                                type="text"
                                name="terms"
                                class="block w-full border-0 p-0 bg-transparent placeholder-gray-500 focus:ring-0 sm:text-sm"
                                placeholder="Remote Marketing Director"
                                autofocus
                            >
                        </div>
                        <div class="flex -space-x-px">
                            <div class="w-1/2 min-w-0 flex-1 border border-gray-300 focus-within:z-10 focus-within:border-indigo-500 focus-within:ring-indigo-500 px-3 py-2">
                                <label for="min" class="block text-xs font-medium opacity-75">Min</label>
                                <input
                                    id="min"
                                    v-model="options.salary.min"
                                    type="number"
                                    :min="50_000"
                                    :step="10_000"
                                    name="min"
                                    class="relative block w-full bg-transparent border-0 focus:ring-0 sm:text-sm p-0"
                                >
                            </div>
                            <div class="min-w-0 flex-1 border border-gray-300 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                <label for="max" class="block text-xs font-medium opacity-75">Max</label>
                                <input
                                    id="max"
                                    v-model="options.salary.max"
                                    type="number"
                                    :max="900_000"
                                    :step="10_000"
                                    name="max"
                                    class="relative block w-full bg-transparent border-0 focus:ring-0 sm:text-sm p-0"
                                >
                            </div>
                        </div>
                        <div class="relative border border-gray-300 px-3 py-2 focus-within:z-10 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                            <label class="block text-xs font-medium opacity-75">Perks</label>
                            <div class="flex flex-wrap mt-4 gap-4">
                                <div
                                    v-for="(perk, perkIndex) in options.perks"
                                    :key="perk"
                                    class="relative flex items-start gap-1"
                                >
                                    <div class="flex h-5 items-center">
                                        <input
                                            :id="`perk-${perkIndex}`"
                                            name="comments"
                                            type="checkbox"
                                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            :checked="perkInTerms(perk)"
                                            @change="togglePerk(perk)"
                                        >
                                    </div>
                                    <div class="text-sm">
                                        <label :for="`perk-${perkIndex}`" class="font-medium text-xs">{{ perk }}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            :disable="!hasTerms"
                            class="inline-flex w-full justify-center rounded-md rounded-t-none border border-transparent bg-indigo-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            :class="[
                                !hasTerms && 'opacity-50 cursor-not-allowed',
                            ]"
                        >
                            Show
                        </button>
                    </form>
                </div>

                <div v-else>
                    <h1>Queries</h1>
                    <button
                        type="button"
                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        @click="showForm = true"
                    >
                        New Terms
                    </button>
                    <ul
                        role="list" class="divide-y divide-gray-200"
                    >
                        <li
                            v-for="variation in queryVariations"
                            :key="variation.query"
                            class="py-4"
                        >
                            <a
                                :href="makeGoogleSearchUrl(variation.query).href"
                                target="_blank"
                                class="block group visited:text-purple-500"
                            >
                                <div class="flex space-x-3">
                                    <div class="flex-1 space-y-1">
                                        <div class="flex flex-col justify-between">
                                            <h3 class="text-sm font-medium group-hover:underline">
                                                {{ variation.label }}
                                            </h3>
                                            <div class="flex w-full text-gray-500 py-3 gap-2">
                                                <input
                                                    read-only
                                                    type="text"
                                                    class="w-full min-w-0 flex-1 text-xs bg-transparent rounded-full border border-gray-300 cursor-pointer px-3 py-2"
                                                    :value="variation.query"
                                                >
                                                <button
                                                    type="button"
                                                    class="text-sm rounded-full border border-transparent bg-black/40 group-hover:bg-indigo-600 px-3 py-2 font-medium text-white shadow-sm"
                                                >
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type {
    QueryPart,
} from '~/utils/queries'
import {
    buildQuery,
    getQueryParts,
    getVariations,
    makeGoogleSearchUrl,
} from '~/utils/queries'
import { getQueries, storeQuery } from '~/utils/storage'

export default {
    name: 'Queries',
    data () {
        return {
            loaded: false,
            showForm: false,
            storedQueries: [] as QueryPart[],
            options: {
                terms: '',
                salary: {
                    min: 70_000,
                    max: 250_000,
                },
                perks: [
                    'Remote',
                    'Health Insurance',
                    '401k',
                    'Paid Time Off',
                    'Stock Options',
                    'Flexible Hours',
                    // 'Insurance',
                    // 'Dental Insurance',
                    // 'Vision Insurance',
                    // 'Life Insurance',
                    // 'Parental Leave',
                    // 'Maternity Leave',
                    // 'Paternity Leave',
                    // 'Disability Insurance',
                    // 'Gym Membership',
                ],
            },
        }
    },
    computed: {
        query () {
            const queryParts: QueryPart[] = []

            if ( this.hasTerms ) {
                queryParts.push( {
                    type: 'text',
                    input: this.options.terms,
                } )
            }

            // Add salary range
            queryParts.push( {
                type: 'salary',
                input: [ this.options.salary.min, this.options.salary.max ],
            } )

            return buildQuery( queryParts )
        },

        hasAnyStoredQueries () {
            return this.storedQueries.length > 0
        },
        hasTerms () {
            if ( !this.options.terms ) {
                return false
            }

            return this.options.terms?.trim()?.length > 0
        },

        queryVariations () {
            return getVariations( this.query )
        },
    },
    mounted () {
        getQueries()
            .then( ( queries ) => {
                this.storedQueries = queries

                if ( queries.length ) {
                    const parts = getQueryParts( queries[ 0 ].text )
                    this.options.terms = parts.terms

                    this.options.salary.min = parts.salary[ 0 ]
                    this.options.salary.max = parts.salary[ 1 ]
                }

                this.loaded = true
            } )

        // Start watching for changes
        // When we trigger a store this will be called
        // so that we sync our local component state
        // watchQueries( ( queries ) => {
        //     console.log( 'watcher', { queries } )
        // } )
    },
    methods: {
        makeGoogleSearchUrl,

        perkInTerms ( perk ) {
            return this.options.terms.toLowerCase().includes( perk.toLowerCase() )
        },
        togglePerk ( perk ) {
            if ( this.perkInTerms( perk ) ) {
                this.options.terms = this.options.terms.replace( perk, '' ).trim()
                return
            }

            this.options.terms += ` ${ perk }`
        },
        async storeQuery () {
            const storedQuery = await storeQuery( {
                text: this.query,
            } )

            this.storedQueries.push( storedQuery )
        },
        async handleSubmit () {
            this.storeQuery( {
                text: this.query,
            } )

            this.showForm = false
        },
    },
}
</script>
