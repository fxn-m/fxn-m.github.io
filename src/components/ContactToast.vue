<template>
    <transition name="toast-fade">
        <div class="toast" v-if="showToast" :class="{ hide: hideToast }">
            Message sent! 👍
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showToast = ref(false);
const hideToast = ref(false);

onMounted(() => {
    showToast.value = true;

    setTimeout(() => {
        // add .hide class to the toast
        hideToast.value = true;
    }, 3000);

    setTimeout(() => {
        showToast.value = false;
    }, 6000);
});

</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 50px;
    left: 50%;
    /* Add this property */
    transform: translateX(-75%);
    /* Center the element horizontally */
    width: 140px;
    height: 20px;
    background-color: #33333329;
    color: #fff;
    padding: 15px 30px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
}

.toast.hide {
    opacity: 0;
    transition: opacity 2s ease
}

</style>