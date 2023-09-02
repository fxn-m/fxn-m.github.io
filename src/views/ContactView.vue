<template>
  <div>
    <br>
    <h3>Let's chat!</h3>
    <p>
      I'm always open to new people and opportunities.
    </p>
    <p>
      Feel free to reach out to me using the form below.
    </p>
    <form @submit.prevent="sendEmail">
      <div style="display: flex; gap: 10px; justify-content: space-between">
        <input type="name" id="name" v-model="name" autocomplete="nope" placeholder="Name">
        <input type="email" id="email" v-model="email" autocomplete="off" placeholder="Email" required>
      </div>
      <textarea id="message" v-model="message" rows="4" placeholder="Message" required @keydown.enter.prevent="submitFormOnEnter"></textarea>

      <button type="submit">Send</button>
    </form>
    <component :is="selectedComponent" v-if="selectedComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue';
import axios from 'axios';

import ContactToast from '@/components/ContactToast.vue';

const email = ref('');
const message = ref('');
const name = ref('');

const showToast = () => {
  selectedComponent.value = ContactToast;
  setTimeout(() => {
    selectedComponent.value = null;
  }, 6000);
};

const sendEmail = () => {

  // Validate the email and message here if needed
  if (!email.value || !message.value) {
    alert('Please fill in both email and message fields.');
    return;
  }

  axios
    .post('http://localhost:3000/send-email', {
      name: name.value,
      email: email.value,
      message: message.value,
    })
    .then((response) => {
      // Handle success
      showToast(); // Display the toast component
    })
    .catch((error) => {
      // Handle error
      alert('Email sending failed');
    });

  // // Clear the form fields after sending the email
  email.value = '';
  message.value = '';
  name.value = '';
};

const submitFormOnEnter = (event: KeyboardEvent) => {
  // Check if the Enter key (key code 13) was pressed
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default behavior (newline in textarea)
    sendEmail(); // Call the form submission function
  }
};

const selectedComponent = ref<Component | null>(null);

</script>


<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: left;
  margin: 40px 0px 0px 0px;
  transition: color 1s ease-in-out, background-color .5s ease-in-out, border-color .5s ease-in-out;
  border-radius: 5px;
}

label {
  font-weight: 500;
  font-size: 0.9em;
}

input,
textarea {
  width: 100%;
  padding: 10px 0px 10px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  transition: color 1s ease-in-out, background-color .5s ease-in-out, border-color .5s ease-in-out;

  &:focus,
  &:focus-visible {
    outline: 1px auto rgba(179, 179, 179, 0.449);
  }
}

/* Target autofill styles for WebKit-based browsers */
input:-webkit-autofill,
textarea:-webkit-autofill {
  /* Specify the background color you want for autofilled fields */
  background-color: inherit !important
    /* or any other color you prefer */
}

textarea {
  resize: vertical;
  min-height: 100px;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  margin: 10px 0px;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background-color: rgb(248, 248, 248);
  max-width: 50%;
  min-width: 100px;
  align-self: right;
  transition: color 1s ease-in-out, background-color .5s ease-in-out, border-color .5s ease-in-out;


  &:hover {
    border-color: #646cff;
  }
}

body.dark input,
body.dark textarea {
  border: 1px solid hsla(231, 66%, 77%, 0.411);
  background-color: #0d121a;
  color: #c3e3f1;
}

body.dark button {
  background-color: #0d121a;
  border: 1px solid #646cff8d;
  color: #c3e3f1;
}
</style>