<script setup>
import {onMounted, reactive} from "vue";
import {useRoute} from "vue-router";

import {editFileRights} from "@/api/methods/files/editFileRights.js";
import {getFiles} from "@/api/methods/files/getFiles.js";
import {deleteRight} from "@/api/methods/files/rights/deleteRight.js";

import Form from "@/components/Form.vue";
import FormItem from "@/components/FormItem.vue";
import Button from "@/components/Button.vue";

const data = reactive({
  fileId: '',
  email: '',
  isLoading: false,
  successMessage: '',
  errorMessage: '',
  errorMessages: [],
  data: [],
  deleteMessage: ''
})

onMounted(() => {
  const { params } = useRoute()

  data.fileId = params.id
})

const handleInputChange = (e) => data.email = e.target.value

const handleGetAccesses = async () => {
  data.isLoading = true

  try {
    data.data = (await getFiles()).filter(file => file.file_id === data.fileId)?.[0].accesses.filter(user => user.type === 'co-author')
    console.log(data.data)
  }
  catch (e) {
    console.error(e)
  }
  finally {
    data.isLoading = false
  }
}

const handleAddFileRight = async () => {
  data.successMessage = ''
  data.errorMessages = []
  data.errorMessage = ''
  data.isLoading = true

  try {
    const response = await editFileRights(data.fileId, data.email)

    if (response.code === 422) {
      data.errorMessages = response.errors
      return
    }

    if (response.code === 401) {
      data.successMessage = response.message
      return
    }

    data.successMessage = 'Успех'
    data.data = response.filter(user => user.type !== 'author')
  }
  catch (e) {
    console.error(e)
  }
  finally {
    data.isLoading = false
  }
}

onMounted(async () => await handleGetAccesses())

const handleDeleteRight = async (fileId, email) => {
  data.deleteMessage = 'Удаляю...'

  try {
    const response = await deleteRight(fileId, email)
    data.data = response.filter(user => user.type !== 'author')
  }
  catch (e) {
    data.deleteMessage = 'Ошибка удаления'
    console.log(e)
  }
  finally {
    setTimeout(() => {
      data.deleteMessage = ''
    }, 2000)
  }

}

</script>

<template>
  <main>
    <h1>Редактирование прав файла</h1>

    <p v-if="data.isLoading">Пытаюсь добавить права...</p>
    <p v-else-if="data.errorMessage">Ошибка: {{ data.errorMessage }} </p>
    <p v-else-if="data.successMessage"> {{ data.successMessage }} </p>

    <Form method="POST" :submit="handleAddFileRight">
      <FormItem
          @change="handleInputChange"
          label="Новый пользователь"
          placeholder="Введите почту"
          id="edit"
          type="email"
          :error-messages="data.errorMessages?.email"
          :value="data.email"
      />

      <Button type="submit">Добавить</Button>
    </Form>

    <h4 v-if="data.data.length && data.deleteMessage">{{ data.deleteMessage }}</h4>
    <ul v-if="data.data.length">
  <li v-for="user in data.data" :key="user.email">
    Почта: {{ user.email }}

    <div>
      <Button @click="handleDeleteRight(data.fileId, user.email)">Удалить права</Button>
    </div>
  </li>
</ul>
    <h3 v-else>Права есть только у вас</h3>
  </main>
</template>

<style scoped>
  ul {
    margin-top: 30px;
  }
</style>