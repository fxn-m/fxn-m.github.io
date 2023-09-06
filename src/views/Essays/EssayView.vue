<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

function useEssayLoader(essayName: string) {
    const essayContent = ref<string>('');

    const fetchEssayContent = async () => {
        try {
            const response = await fetch(`../src/content/essays/${essayName}.html`);
            if (response.ok) {
                essayContent.value = await response.text();
            } else {
                // Handle error loading essay
                new Error('Error loading essay');
            }
        } catch (error) {
            // Handle fetch error
            new Error('Error fetching essay');
        }
    };

    onMounted(() => {
        fetchEssayContent();
    });

    return {
        essayContent,
    };
}

const route = useRoute();
const essayName = (route.params.name as string).replace(':', '');
const { essayContent } = useEssayLoader(essayName);

</script>


<template>
    <div id="essay">
        <div v-html="essayContent"></div>
    </div>
</template>
  

  