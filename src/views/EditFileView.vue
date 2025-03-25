<script setup>
import {onMounted, reactive} from "vue";
  import {useRoute} from "vue-router";

import {editFileName} from "@/api/methods/files/editFileName.js";

import Form from "@/components/Form.vue";
import FormItem from "@/components/FormItem.vue";
import Button from "@/components/Button.vue";

  const data = reactive({
    fileId: '',
    newFileName: '',
    isLoading: false,
    successMessage: '',
    errorMessage: '',
    errorMessages: [],
  })

  onMounted(() => {
    const { params } = useRoute()

    data.fileId = params.id
  })

  const handleInputChange = (e) => data.newFileName = e.target.value

  const handleChangeFileName = async () => {
    data.successMessage = ''
    data.errorMessages = []
    data.errorMessage = ''
    data.isLoading = true

    try {
      const response = await editFileName(data.fileId, data.newFileName)

      if (response.code === 422) {
        data.errorMessages = response.message
        return
      }

      if (response.code === 401) {
        data.successMessage = response.message
        return
      }

      data.successMessage = 'Успех'
    }
    catch (e) {
      console.error(e)
    }
    finally {
      data.isLoading = false
    }

  }
</script>

<template>
  <main>
    <h1>Редактирование имени файла</h1>

    <p v-if="data.isLoading">Пытаюсь поменять имя...</p>
    <p v-else-if="data.errorMessage">Ошибка: {{ data.errorMessage }} </p>
    <p v-else-if="data.successMessage"> {{ data.successMessage }} </p>

    <Form method="POST" :submit="handleChangeFileName">
      <FormItem
          @change="handleInputChange"
          label="Имя файла"
          placeholder="Введите имя файла"
          id="edit"
          :error-messages="data.errorMessages?.name"
          :value="data.newFileName"
      />

      <Button type="submit">Обновить</Button>
    </Form>
  </main>
</template>
