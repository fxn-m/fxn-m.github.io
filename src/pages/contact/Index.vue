<template>
  <div class="max-w-2xl mx-auto px-4">
    <p class="text-base mb-6 dark:text-gray-200">
      Feel free to get in touch using the form below, or just send me an
      <a href="mailto:fnewportmangell@gmail.com" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">e-mail</a>
    </p>
    <form @submit.prevent="sendEmail" class="flex flex-col gap-4 my-6">
      <div class="flex flex-col gap-4">
        <input
          type="name"
          id="name"
          v-model="name"
          autocomplete="nope"
          placeholder="Your name"
          class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
        />
        <input
          type="email"
          id="email"
          v-model="email"
          autocomplete="off"
          placeholder="Your email"
          required
          class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
        />
      </div>
      <textarea
        id="message"
        v-model="message"
        rows="4"
        placeholder="Your message"
        required
        @keydown.enter.prevent="submitFormOnEnter"
        class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y min-h-[100px] text-sm font-sans"
      ></textarea>
      <button type="submit" class="ml-auto min-w-[200px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
        Send{{ sendingEllipses }}
      </button>
    </form>

    <!-- Radix Vue Toast -->
    <ToastProvider>
      <ToastRoot v-model:open="toastOpen" class="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg rounded-lg p-4">
        <ToastTitle class="font-semibold text-sm">
          {{ toastSent ? "Message Sent!" : "Message Failed" }}
        </ToastTitle>
        <ToastDescription class="text-xs">
          {{ toastSent ? "Your message was successfully delivered." : "Something went wrong. Please try again." }}
        </ToastDescription>
      </ToastRoot>
      <ToastViewport class="fixed bottom-4 right-4 flex flex-col gap-2 w-auto z-50" />
    </ToastProvider>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import axios from "axios"
  import { ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastViewport } from "radix-vue"

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const email = ref("")
  const message = ref("")
  const name = ref("")
  const sendingEllipses = ref("")

  const toastOpen = ref(false)
  const toastSent = ref(false)

  const sendEmail = () => {
    let counter = 0
    const ending = "ing"
    const sendingLoader = setInterval(() => {
      if (counter > 6) {
        sendingEllipses.value = "ing."
        counter = 3
      } else if (counter > 2) {
        sendingEllipses.value += "."
      } else {
        sendingEllipses.value += ending[counter]
      }
      counter++
    }, 400)

    const clearUp = (success: boolean) => {
      clearInterval(sendingLoader)
      sendingEllipses.value = ""
      if (success) {
        email.value = ""
        message.value = ""
        name.value = ""
      }
    }

    axios
      .post(`${BACKEND_URL}/send-email`, {
        name: name.value,
        email: email.value,
        message: message.value
      })
      .then(() => {
        toastSent.value = true
        toastOpen.value = true
        clearUp(true)
        setTimeout(() => (toastOpen.value = false), 5000)
      })
      .catch(() => {
        toastSent.value = false
        toastOpen.value = true
        clearUp(false)
        setTimeout(() => (toastOpen.value = false), 5000)
      })
  }

  const submitFormOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      sendEmail()
    }
  }
</script>
