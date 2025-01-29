<template>
  <div class="login">
    <el-input placeholder="code" prefix-icon="el-icon-key" v-model="code" @change="getToken" autofocus/>
  </div>
</template>

<script>
import VueCookies from 'vue-cookies'

export default {
  name: "LoginView",
  data() {
    return {
      code: ''
    }
  },
  methods: {
    async getToken() {
      try {
        const res = await this.$http.get(`/../token/from/${this.code}`)
        const { token, msg } = res.data
        
        if (!token) {
          this.$message.error(msg);
        }
        
        VueCookies.set('token', token, "2d")
        this.$router.push('/')
      } catch(err) {
        this.$message.error(err)
      }
    }
  },
};
</script>

<style scoped>
.login .el-input {
  max-width: 13rem;
}
</style>