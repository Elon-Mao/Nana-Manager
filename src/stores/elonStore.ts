import { defineStore } from 'pinia'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
  type WithFieldValue,
  type DocumentData
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import customPromise from '@/common/customPromise'

export const elonStore = <
  NavWithoutId extends WithFieldValue<DocumentData>,
  Entity extends NavWithoutId
>(
  storeId: string
) => {
  type EntityNav = NavWithoutId & {
    id: string
  }

  const useStore = defineStore(storeId, {
    state: () => {
      return {
        navs: [] as EntityNav[],
        entityMap: {} as Record<string, Entity>,
        editingEntity: null as Entity | null
      }
    },
    actions: {
      getById(id: string) {
        if (!id || this.entityMap[id]) {
          return
        }
        onSnapshot(doc(storeCollection, id), (newDoc) => {
          this.entityMap[id] = newDoc.data() as Entity
        })
      },
      async setById(id: string, entity: Entity) {
        await customPromise(
          Promise.all([setDoc(doc(storeCollection, id), entity), updateDoc(navDoc, {
            [id]: entity as NavWithoutId
          })])
        )
      },
      async addEntity(entity: Entity) {
        const newDoc = doc(storeCollection)
        this.getById(newDoc.id)
        await this.setById(newDoc.id, entity)
      },
      async deleteById(id: string) {
        await customPromise(
          Promise.all([
            deleteDoc(doc(storeCollection, id)),
            updateDoc(navDoc, {
              [id]: deleteField()
            })
          ])
        )
        delete this.entityMap[id]
      },
      async saveEditing() {

      }
    }
  })

  const store = useStore()
  const storeCollection = collection(db, storeId)
  const navDoc = doc(storeCollection, 'nav')
  onSnapshot(
    navDoc,
    (newDoc) => {
      store.navs = Object.entries(newDoc.data()!).map(([id, nav]) => Object.assign(nav, { id }))
    }
  )
  return useStore
}
