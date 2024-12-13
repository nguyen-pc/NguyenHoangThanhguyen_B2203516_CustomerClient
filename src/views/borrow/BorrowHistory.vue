<template>
  <div class="p-5 mt-10">
    <div>
      <template v-if="!filteredData.length">
        <div>Không có mượn quyển sách nào</div>
      </template>
      <template v-else>
        <div class="title">Lịch sử mượn sách</div>
        <table class="min-w-full border-collapse block md:table">
          <thead class="block md:table-header-group">
            <tr
              class="border border-gray-300 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative"
            >
              <th
                v-for="column in columns"
                :key="column.key"
                class="bg-gray-200 p-2 text-gray-600 font-bold block md:table-cell"
              >
                {{ column.title }}
              </th>
              <!-- <th class="bg-gray-200 p-2 text-gray-600 font-bold block md:table-cell">
                Hành động
              </th> -->
            </tr>
          </thead>
          <tbody class="block md:table-row-group">
            <tr
              v-for="row in filteredData"
              :key="row.id"
              class="bg-gray-100 border border-gray-300 md:border-none block md:table-row"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="p-2 text-gray-800 block md:table-cell"
                v-html="renderCell(row, column)"
              ></td>
              <!-- <td class="p-2 text-gray-800 block md:table-cell"> -->
              <!-- <template v-if="!row.actualReturnDate"> -->
              <!-- <button @click="returnBook(row)" class="return-btn">Trả sách</button> -->
              <!-- </template> -->
              <!-- <template v-else> -->
              <!-- <span>Đã trả</span> -->
              <!-- </template> -->
              <!-- <button @click="returnBook(row)" class="text-blue-500">{{}}Trả sách</button> -->
              <!-- </td> -->
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";
import { title } from "process";

const route = useRoute();
const bookStore = useBookStore();
const borrowStore = useBorrowStore();
const authStore = useAuthStore();
const book = ref(null);
const auth = ref(null);

const query = ref("");

const columns = [
  { title: "Tên sách", dataIndex: "book.name", key: "book" },
  { title: "Ngày mượn", dataIndex: "borrowedDay", key: "borrowedDay" },
  { title: "Hạn trả", dataIndex: "estimatedReturnDate", key: "estimatedReturnDate" },
  { title: "Ngày đã trả", dataIndex: "actualReturnDate", key: "actualReturnDate" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const fetchBorrow = async () => {
  try {
    await borrowStore.getUserBorrow(authStore.user.id);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

const fetchUser = async () => {
  try {
    await authStore.getUser();
  } catch (e) {
    console.log("Error fetching", e);
  }
};

onMounted(() => {
  fetchUser();
  fetchBorrow();
});

const filteredData = computed(() => {
  if (!query.value) {
    return borrowStore.allBorrows;
  }
  return borrowStore.allBorrows.filter((item: any) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(query.value.toLowerCase())
    );
  });
});

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const renderCell = (row: any, column: any) => {
  const keys = column.dataIndex.split(".");
  let value = row;
  try {
    keys.forEach((key: any) => {
      value = value[key];
    });
    if (["borrowedDay", "estimatedReturnDate", "actualReturnDate"].includes(column.key)) {
      return formatDate(value);
    }
    if (column.key === "status") {
      return `<span class="status-badge ${value.toLowerCase()}">${value}</span>`;
    }
  } catch (error) {
    console.error("Error accessing value for column:", column, "row:", row);
    value = ""; // Hoặc giá trị mặc định nào đó nếu cần thiết
  }
  return value !== undefined && value !== null ? value : "";
};

const returnBook = async (row: any) => {
  try {
    const currentDate = new Date().toISOString(); // Lấy ngày hiện tại
    const payload = {
      returnDate: currentDate,
    };
    await borrowStore.returnBook(row._id, payload);
    await fetchBorrow();
    await bookStore.getAllBooks(1, 10);
    alert("Trả sách thành công");
  } catch (error) {
    console.error("Error returning book:", error);
    alert("Có lỗi xảy ra khi trả sách");
  }
};
</script>

<style>
.status-badge {
  padding: 4px 8px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  display: inline-block !important;
  text-align: center !important;
}
.borrowed {
  background-color: #fef3c7 !important;
  color: #92400e !important;
}

.returned {
  background-color: #dcfce7;
  color: #166534;
}

.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}
.approved {
  background-color: #fee2e2 !important;
  color: #1b6999 !important;
}

.pending {
  background-color: #e0e7ff;
  color: #3730a3;
}
.return-btn {
  background-color: #228b22;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.title {
  font-size: 30px;
  font-weight: 600;
  color: #228b22;
  margin-bottom: 25px;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid black;
  padding: 8px;
}
th {
  background-color: #f4f4f4;
}
</style>
