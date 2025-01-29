<template>
  <div class="detail">
    <el-card v-loading="loading">
        <div slot="header" class="header">
          <div class="toolbar">
            <el-button type="danger" size="small" plain icon="el-icon-delete" style="padding: 6px 8px;" @click="doDelete"/>
          </div>
          <h3 class="subject">{{ subject }}</h3>
          <div class="meta">
            <p>
              <span>发件人：</span>
              <span>{{ from.name ? from.name + ' ' : '' }}&lt;<el-link :href="'mailto:' + from.address">{{ from.address }}</el-link>&gt;</span>
            </p>
            <p>
              <span>时&emsp;间：</span>
              <span>{{ date }}</span>
            </p>
            <p>
              <span>收件人：</span>
              <template v-for="(item, index) in to">
                <span :key="index">{{ item.name ? item.name + ' ' : '' }}&lt;<el-link :href="'mailto:' + item.address">{{ item.address }}</el-link>&gt;&emsp;</span>
              </template>
            </p>
          </div>
        </div>
        <div class="body" v-html="html"></div>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'DetailView',
  data() {
    return {
      loading: true,
      subject: '',
      from: '',
      to: '',
      date: '',
      html: '',
      id: '',
      token: ''
    }
  },
  computed: {},
  watch: {},
  async mounted() {
    const { id, t } = this.$route.query
    const token = t || this.$cookies.get('token')

    try {
        const res = await this.$http.get('/detail', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { id }
        })

        if (!res.data.results) {
          this.$message.error(res.data.msg.split(': ')[0])
          this.$router.push('/')
        }

        const { subject, from, to, date, html, text} = res.data.results

        this.subject = subject
        this.from = from
        this.to = to
        this.date = this.$moment(date).format('YYYY年M月D日 hh:mm:ss')
        this.html = html || text
        this.id = id
        this.token = token
        this.loading = false
    } catch(err) {
      this.$message.error(err)
    }
  },
  methods: {
    async doDelete() {
      try {
        await this.$confirm('此操作将永久删除该邮件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await this.$http.post('/del', { ids: this.id }, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const { msg } = res.data

        this.$message({
          message: msg,
          type: 'success'
        })

        setTimeout(() => {
          if (window.history.length > 1) {
            this.$router.back()
          } else {
            this.$router.push('/')
          }
        }, 3000);
      } catch(err) {
        this.$message.error(err)
      }
    }
  },
};
</script>
<style scoped>
.header {
  padding: 0;
}
.subject {
  margin: 0;
  margin-bottom: 10px;
}
.meta p {
  margin: 0;
  font-size: 12px!important;
}
.meta p .el-link {
  font-size: 12px!important;
  vertical-align: unset!important;
}
.meta p span:first-child {
  color: #909399;
}

.toolbar {
  float: right;
}
</style>