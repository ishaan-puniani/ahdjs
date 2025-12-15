
 
 <a href="https://www.npmjs.com/package/@hodgef/ts-library-boilerplate-basic"><img src="https://badgen.net/npm/v/@hodgef/ts-library-boilerplate-basic?color=blue" alt="npm version"></a> <a href="https://github.com/hodgef/ts-library-boilerplate"><img src="https://img.shields.io/github/last-commit/hodgef/ts-library-boilerplate" alt="latest commit"></a> <a href="https://github.com/hodgef/ts-library-boilerplate-basic/actions"><img alt="Build Status" src="https://github.com/hodgef/ts-library-boilerplate-basic/workflows/Build/badge.svg?color=green" /></a> <a href="https://github.com/hodgef/ts-library-boilerplate-basic/actions"> <img alt="Publish Status" src="https://github.com/hodgef/ts-library-boilerplate-basic/workflows/Publish/badge.svg?color=green" /></a>

# To get started 


### npm Installtion
```
npm install ahdjs --save
```

### yarn Installtion
```
yarn add ahdjs
```
### app components
```
import AHDjs from 'ahdjs';
...
const ahdJS = new AHDjs(undefined, {applicationId: '<Application ID from Back office>'});
...

ahdJS.initializeSiteMap();
ahdJS.updatePageUrl(props.url, false); <<-- to connect with router
```

### Example 
```

let _ahdJs = new AHDjs(undefined, {
  applicationId: "64d2b934c6cfdc96aa3734c5",
  apiHost: "https://ahd.fabbuilder.com",
});
_ahdJs.initializeSiteMap();

setTimeout(() => {
  _ahdJs.showPageTour("/auth/signin");
}, 1000);
```


### self-host/cdn

```
<script src="build/index.js"></script>

const AHDjs = window.AHDjs.default;
const ahdJS = new AHDjs();
...
```


# For development and contribution
## ⭐️ Features

- Webpack 5
- Babel 7
- Hot reloading (`npm start`)
- Automatic Types file generation (index.d.ts)
- UMD exports, so your library works everywhere.
- Jest unit testing
- Customizable file headers for your build [(Example 1)](https://github.com/hodgef/ts-library-boilerplate-basic/blob/master/build/index.js) [(Example2)](https://github.com/hodgef/ts-library-boilerplate-basic/blob/master/build/css/index.css)
- Daily [dependabot](https://dependabot.com) dependency updates

## 📦 Getting Started

```
git clone https://github.com/ishaan-puniani/ahdjs.git
cd ahdjs
npm install
```

## 💎 Customization

> Before shipping, make sure to:

1. Edit `LICENSE` file
2. Edit `package.json` information (These will be used to generate the headers for your built files)
3. Edit `library: "MyLibrary"` with your library's export name in `./webpack.config.js`

## 🚀 Deployment

1. `npm publish`
2. Your users can include your library as usual

## ✅ Libraries built with this boilerplate

> Made a library using this starter kit? Share it here by [submitting a pull request](https://github.com/hodgef/ts-library-boilerplate-basic/pulls)!
>

