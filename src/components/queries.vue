<template>
    <div class="wrapper flex justify-center">
        <div
            class="container max-w-sm border p-6" :class="[
                !loaded && 'shimmer',
            ]"
        >
            <h1>Queries</h1>
            <div>
                <ul role="list" class="divide-y divide-gray-200">
                    <li v-for="activityItem in activityItems" :key="activityItem.id" class="py-4">
                        <div class="flex space-x-3">
                            <img class="h-6 w-6 rounded-full" :src="activityItem.person.imageUrl" alt="">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-medium">
                                        {{ activityItem.person.name }}
                                    </h3>
                                    <p class="text-sm">
                                        {{ activityItem.time }}
                                    </p>
                                </div>
                                <p class="text-sm">
                                    Deployed {{ activityItem.project }} ({{ activityItem.commit }} in master) to {{ activityItem.environment }}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
const people = [
    {
        name: 'Lindsay Walton',
        imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
    },
    // More people...
]
const activityItems = Array.from( { length: 5 }, ( _, i ) => ( {
    id: i,
    person: people[ i % people.length ],
    time: '4:32 PM',
    project: 'Tailwind CSS',
    commit: 'f7df826',
    environment: 'Production',
} ) )

export default {
    name: 'Queries',
    data () {
        return {
            loaded: false,
            people,
            activityItems,
        }
    },
    mounted () {
        setTimeout( () => {
            this.loaded = true
        }, 2000 )
    },
    methods: {

    },
}
</script>
