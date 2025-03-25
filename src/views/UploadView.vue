<script setup>
import {ref} from "vue";

import Form from "@/components/Form.vue";
import FormItem from "@/components/FormItem.vue";
import Button from "@/components/Button.vue";

import {handleUploadFiles} from "@/utils/handleUploadFiles.js";
import {handleDownloadFile} from "@/utils/handleDownloadFile.js";

const isLoading = ref()
const uploadedFiles = ref([])

const onSubmit = async (event) => {
  uploadedFiles.value = []
  const files = event.target.files
  if (!files.length) return

  isLoading.value = true

  try {
    uploadedFiles.value = await handleUploadFiles(files)
  }
  catch (e) {
    console.error(e)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Загрузка файлов</h1>

    <p>Выберите файлы для загрузки</p>

    <Form :submit="onSubmit" method="Post">
      <FormItem
          type="file"
          label="Загрузка файлов"
          id="fileInput"
          @change="onSubmit"
          multiple
      />
    </Form>

    <section>
      <p v-if="isLoading">Загрузка...</p>
      <ul class="list" v-if="uploadedFiles.length">
        <li v-for="file in uploadedFiles">
          <h4>Имя: {{ file.name }}</h4>
          <p>
            Статус:
            <span :class="[{ error: !file.success, success: file.success }]">
              {{ file.success ? 'загружен' : 'ошибка' }}
            </span>
          </p>
          <Button v-if="file.success" @click="handleDownloadFile(file)">Скачать</Button>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
  .error {
    color: var(--error-text);
  }

  .success {
    color: var(--color-pink);
  }

  .list {
    margin-top: 30px;

    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 15px;
  }

  .list > li {
    flex-basis: 30%;

    list-style-type: none;
    border: 2px solid var(--secondary-color);
    border-radius: 8px;
    padding: 30px;

    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>