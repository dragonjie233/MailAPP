<template>
  <div id="app">
    <el-header>
      <div class="container">
        <div class="title">
          <el-image
            style="width: 100px; height: 100px"
            :src="iconTitle"
          >
            <template slot="error">
              <i class="el-icon-receiving"></i>
            </template>
          </el-image>
          <el-link href="/" :underline="false">{{ title }}</el-link>
        </div>
      </div>
    </el-header>
    <el-main>
      <div class="container">
        <router-view/>
      </div>
    </el-main>
  </div>
</template>

<script>
import config from '../config'
export default {
  data() {
    return {
      title: config.title,
      iconTitle: require('../public/images/icon-title.png')
    }
  }
}
</script>

<style>
body {
  margin: 0;
  background-color: rgb(244, 244, 245);
}

#app {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #EBEEF5;
}
.el-header .container {
  height: 100%;
  display: flex;
  align-items: center;
}

.el-main {
  height: calc(100% - 60px);
}
.el-main .container, .home {
  height: 100%;
}

.container {
  max-width: 70rem;
  margin: auto;
}

.title {
  display: flex;
  align-items: center;
}
.title .el-image {
  width: 24px!important;
  height: 24px!important;
  margin: 0 10px;
}
.title .el-image img {
  image-rendering: pixelated;
}
.title .el-link {
    font-size: 20px;
  font-weight: bold;
}
.title .el-link:hover {
  color: #606266!important;
}
</style>
