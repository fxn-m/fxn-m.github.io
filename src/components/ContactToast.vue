<template>
    <transition name="toast-fade">
        <div class="toast" v-if="showToast" :class="{ hide: hideToast }">
            <p>
                {{ sent ? "Message sent!" : "Message didn't send." }}
            </p>
            <p>
                {{ sent ? "👍" : "👎" }}
            </p>
        </div>
    </transition>
</template>

<script setup lang="ts">
const props = defineProps({
    sent: Boolean,
});

import { ref, onMounted } from 'vue';

const showToast = ref(false);
const hideToast = ref(false);

onMounted(() => {
    showToast.value = true;

    setTimeout(() => {
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
    bottom: 30px;
    left: 50%;
    transform: translateX(-75%);
    background-color: rgba(248, 248, 248, 0.5);
    color: #161515;
    padding: 10px 30px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
}

p {
    padding: 0;
    margin: 5px 0;
}

body.dark .toast {
    background-color: #33333329;
    color: #fff;
}

.toast.hide {
    opacity: 0;
    transition: opacity 2s ease
}

@media (max-width: 900px) {
    .toast {
        bottom: 10px;
        left: 62%;
    }
}
</style>