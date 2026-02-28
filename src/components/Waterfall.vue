<template>
  <view class="waterfall-wrapper">
    <!-- 左侧列 -->
    <view class="waterfall-column" id="left-column">
      <view
        v-for="note in leftColumnNotes"
        :key="note.id"
        class="waterfall-item"
      >
        <NoteCard :note="note" @click="handleNoteClick(note)" />
      </view>
    </view>

    <!-- 中间列 -->
    <view class="waterfall-column" id="middle-column">
      <view
        v-for="note in middleColumnNotes"
        :key="note.id"
        class="waterfall-item"
      >
        <NoteCard :note="note" @click="handleNoteClick(note)" />
      </view>
    </view>

    <!-- 右侧列 -->
    <view class="waterfall-column" id="right-column">
      <view
        v-for="note in rightColumnNotes"
        :key="note.id"
        class="waterfall-item"
      >
        <NoteCard :note="note" @click="handleNoteClick(note)" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NoteCard from './NoteCard.vue'
import type { Note } from '@/types/api.types'

interface Props {
  notes: Note[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'noteClick', note: Note): void
}>()

const columnCount = ref(2)

// 检测屏幕宽度决定列数
const updateColumnCount = () => {
  if (typeof window !== 'undefined') {
    columnCount.value = window.innerWidth >= 768 ? 3 : 2
  }
}

onMounted(() => {
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})

// 将笔记分配到多列
const leftColumnNotes = computed(() => {
  return props.notes.filter((_, index) => index % columnCount.value === 0)
})

const middleColumnNotes = computed(() => {
  if (columnCount.value < 3) return []
  return props.notes.filter((_, index) => index % columnCount.value === 1)
})

const rightColumnNotes = computed(() => {
  if (columnCount.value < 2) return []
  return props.notes.filter((_, index) => index % columnCount.value === columnCount.value - 1)
})

const handleNoteClick = (note: Note) => {
  emit('noteClick', note)
}
</script>

<style scoped>
.waterfall-wrapper {
  display: flex;
  padding: 8px 8px;
  box-sizing: border-box;
  width: 100%;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.waterfall-item {
  animation: fadeSlideUp 0.6s ease-out backwards;
  width: 100%;
  box-sizing: border-box;
}

.waterfall-item:nth-child(1) { animation-delay: 0s; }
.waterfall-item:nth-child(2) { animation-delay: 0.08s; }
.waterfall-item:nth-child(3) { animation-delay: 0.16s; }
.waterfall-item:nth-child(4) { animation-delay: 0.24s; }
.waterfall-item:nth-child(5) { animation-delay: 0.32s; }

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* PC端三列布局 */
@media (min-width: 768px) {
  .waterfall-wrapper {
    gap: 16px;
    padding: 0 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .waterfall-column {
    gap: 16px;
  }
}
</style>
