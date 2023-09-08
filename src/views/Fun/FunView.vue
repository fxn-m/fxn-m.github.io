<script setup lang="ts">
import AnyHTML from '../../components/AnyHTML.vue'
import { useRoute } from 'vue-router';
import { ref, onMounted, type Component } from 'vue';

const props = defineProps({
  // Declare props here if you have any
});

const selectedComponent = ref<Component>();

const selectComponent = () => {
  const route = useRoute();
  const routeName = (route.params.name as string).replace(':', '');

  const components = {
    AnyHTML,
  };

  if (routeName == 'anyhtml') {
    selectedComponent.value = components.AnyHTML;
  }
};

onMounted(() => {
  selectComponent();
});

</script>

<template>
  <div id="content">
    <!-- Use the dynamic component to render the selected component -->
    <component :is="selectedComponent" v-if="selectedComponent" />
  </div>
</template>
