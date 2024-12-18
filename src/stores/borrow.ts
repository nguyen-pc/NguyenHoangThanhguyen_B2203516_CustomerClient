import { defineStore } from 'pinia'
import { useApi, useApiPrivate } from '../composables/useApi'

export enum BorrowStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RETURNED = 'returned',
  REJECTED = 'rejected'
}


export interface Borrow {
  id: string
  email: String
  bookName: String
  user: string
  book: string
  borrowedDay: Date
  estimatedReturnDate: Date
  actualReturnDate?: Date
  status: BorrowStatus

}

export interface State {
  borrows: Borrow[]
}

export const useBorrowStore = defineStore('borrow', {
  state: (): State => {
    return {
      borrows: [] as Borrow[]
    }
  },

  getters: {
    allBorrows: (state: State) => state.borrows
  },

  actions: {
    async getAllBorrows() {
      try {
        const { data } = await useApi().get('/api/borrow')
        this.borrows = data
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async createBorrow(borrowData: Borrow) {
      try {
        const payload = {
          ...borrowData,
          status: BorrowStatus.PENDING  // Luôn set trạng thái mặc định là pending
        };
        const { data } = await useApi().post('/api/borrow/create', payload)
        console.log(borrowData)
        this.borrows.push(data)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async getUserBorrow(user: any) {
      try {
        const { data } = await useApi().get(`/api/borrow/userBorrow/${user}`)
        this.borrows = data
        return data
      } catch (e: Error | any) {
        throw e.message
      }
    },
    async returnBook(borrowId: string, payload: { returnDate: string }) {
      try {
        const { data } = await useApiPrivate().post(`/api/borrow/return/${borrowId}`, payload)
        const borrowIndex = this.borrows.findIndex((borrow) => borrow.id === borrowId)
        if (borrowIndex !== -1) {
          this.borrows[borrowIndex].actualReturnDate = data.actualReturnDate
        }
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async deleteBorrow(borrowId: string) {
      try {
        await useApiPrivate().delete(`/api/borrow/${borrowId}`)
        this.borrows = this.borrows.filter((borrow) => borrow.id !== borrowId)
      } catch (error: Error | any) {
        throw error.message
      }
    }
  }
})
