import { ref } from "vue"

export const theme = ref(sessionStorage.getItem("theme"))
