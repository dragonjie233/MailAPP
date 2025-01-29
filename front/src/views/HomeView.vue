<template>
  <div class="home">
    <el-card
      :body-style="{
        padding: '10px',
        height: 'calc(100% - 20px)'
      }"
    >
      <div style="margin-bottom: 10px;">
        <el-button type="danger" size="small" plain :disabled="delBtnDisable" @click="doDelete">删除{{ selectSum }}选中项</el-button>
        <el-button type="primary" size="small" plain style="float: right;" :disabled="noMore" @click="getEmailList">继续加载</el-button>
      </div>

      <el-table
        empty-text="暂无邮件"
        height="calc(100% - 45px)"
        v-loading="loading"
        :data="emailList"
        :default-sort="{
          prop: 'at',
          order: 'descending'
        }"
        :cell-style="{
          padding: '8px 0',
        }"
        :header-cell-style="{
          padding: '0',
          background: '#f3f3f3',
        }"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          align="center"
        />
        <el-table-column
          prop="to"
          label="邮箱"
          width="120"
          :formatter="splitMailPrefix"
          :filters="toFilters"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="from"
          label="发件人"
          width="220"
          :filters="fromFileters"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="subject"
          label="主题"
        />
        <el-table-column
          prop="at"
          label="日期"
          align="center"
          width="120"
          sortable
          
          :formatter="dateFormat"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      page: -1,
      pageSize: 10,
      emailList: [],
      tempFilters: [],
      toFilters: [],
      fromFileters: [],
      noMore: false,
      loading: false,
      delBtnDisable: true,
      ids: '',
      selectSum: '',
    }
  },
  methods: {
    async getEmailList(re) {
      let nextPage = this.page + 1

      if (this.page >= 0) {
        nextPage = nextPage + this.pageSize - 1
      }

      try {
        if (this.noMore) return;
        if (this.loading) return;

        this.loading = true

        const token = this.$cookies.get('token')
        const res = await this.$http.get('/list', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            page: nextPage,
            pageSize: this.pageSize
          }
        })
        const { page, pageSize, results } = res.data

        if (results.length == 0) {
          this.$message('无再多的邮件了')
          this.noMore = true
          this.loading = false
          return;
        }

        this.page = parseInt(page)
        this.pageSize = parseInt(pageSize)
        this.emailList = re ? results : [ ...this.emailList, ...results ]
        this.loading = false
      } catch(err) {
        this.$message.error(err)
      }
    },
    async doDelete() {
      const token = this.$cookies.get('token')

      try {
        await this.$confirm('此操作将永久删除该邮件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await this.$http.post('/del', { ids: this.ids }, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const { msg } = res.data

        this.$message({
          message: msg,
          type: 'success'
        })

        this.page = this.page - 1
        this.getEmailList(true)
      } catch(err) {
        this.$message.error(err)
      }
    },
    dateFormat(r, c, v) {
      return this.$moment(v).format('M月D日')
    },
    splitMailPrefix(r, c, v) {
      return v.split('@')[0]
    },
    genFiltersArr(list) {
      const temp = this.tempFilters

      list = list || this.emailList

      list.forEach(val => {
        const { to, from } = val

        if (!temp.includes(to)) {
          this.toFilters.push({
            text: to,
            value: to
          })

          temp.push(to)
        }

        if (!temp.includes(from)) {
          this.fromFileters.push({
            text: from,
            value: from
          })
          
          temp.push(from)
        }
      })

      this.tempFilters = temp
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleSelectionChange(arr) {
      let ids = ''

      if (arr.length == 0) {
        this.delBtnDisable = true
        this.selectSum = ''
        return;
      }

      arr.forEach(item => {
        ids += item.id + ','
      })

      this.ids = ids.slice(0, -1)
      this.delBtnDisable = false
      this.selectSum = ` ${arr.length} 个`
    },
    handleRowClick(obj) {
      const { id } = obj

      this.$router.push('/detail?id=' + id)
    }
  },
  watch: {
    emailList(val) {
      this.genFiltersArr(val)
    }
  },
  mounted() {
    this.getEmailList()
    this.genFiltersArr()
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
  border-radius: 8px;
}

::v-deep .el-table__cell .cell {
  white-space: nowrap;
}
::v-deep .el-table__cell.gutter {
    background: #f3f3f3;
}
</style>