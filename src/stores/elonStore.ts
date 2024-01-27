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
  BriefWithoutId extends WithFieldValue<DocumentData>,
  Entity extends BriefWithoutId
>(
  storeId: string,
  briefKeys: (keyof BriefWithoutId)[]
) => {
  type BriefEntity = BriefWithoutId & {
    id: string
  }
  type EntityWithoutBrief = Omit<Entity, keyof BriefWithoutId>

  const useStore = defineStore(storeId, {
    state: () => {
      return {
        entityMap: {} as Record<string, Entity>,
        briefEntities: [] as BriefEntity[],
        briefEntityMap: {} as Record<string, BriefWithoutId>,
      }
    },
    actions: {
      getById(id: string) {
        if (!id || this.entityMap[id]) {
          return
        }
        onSnapshot(doc(storeCollection, id), (newDoc) => {
          this.entityMap[id] = {
            ...newDoc.data(),
            ...this.briefEntityMap[id]
          } as Entity
        })
      },
      async setById(id: string, entity: Entity) {
        const entityWithoutBrief = {} as EntityWithoutBrief
        const briefWithoutId = {} as BriefWithoutId
        Object.keys(entity).forEach((key) => {
          if (briefKeys.includes(key)) {
            briefWithoutId[key] = entity[key]
          } else {
            entityWithoutBrief[key as keyof EntityWithoutBrief] = entity[key]
          }
        })

        await customPromise(
          Promise.all([
            setDoc(doc(storeCollection, id), entityWithoutBrief),
            updateDoc(briefDoc, {
              [id]: briefWithoutId
            })
          ])
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
            updateDoc(briefDoc, {
              [id]: deleteField()
            })
          ])
        )
        delete this.entityMap[id]
        delete this.briefEntityMap[id]
      }
    }
  })

  const store = useStore()
  const storeCollection = collection(db, storeId)
  const briefDoc = doc(storeCollection, 'briefEntities')
  onSnapshot(
    briefDoc,
    (newDoc) => {
      store.briefEntities = Object.entries(newDoc.data()!).map(([id, brief]) => {
        store.briefEntityMap[id] = brief
        // if (storeId === 'courses') {
        //   updateDoc(doc(storeCollection, id), {
        //     date: deleteField()
        //   })
        // }
        return {
          id,
          ...brief
        }
      })
    }
  )
  return useStore
}
