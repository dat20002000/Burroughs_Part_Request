// -- BUILD VERSION STUFF ------------------
// Make some changes to be able to display the build version in the
// console.  This is not used for anything else.
const now = new Date()
const year = now.getUTCFullYear().toString();
let monthTemp = now.getUTCMonth() + 1;
const month = monthTemp.toString().padStart(2, '0');
const date = now.getUTCDate().toString().padStart(2, '0');
const hours = now.getUTCHours().toString().padStart(2, '0');
const minutes = now.getUTCMinutes().toString().padStart(2, '0');
const seconds = now.getUTCSeconds().toString().padStart(2, '0');
const buildDate = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}Z`

var webpack = require('webpack');

let gitCommitHash = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

let gitCurrentBranch = require('child_process')
	.execSync('git rev-parse --abbrev-ref HEAD')
	.toString()
	.trim();

let gitWorkingCopyStatus = require('child_process')
	.execSync('git status --short')
	.toString()
	.trim();

// -- END BUILD VERSION STUFF ------------------


const {
	defineConfig
} = require('@vue/cli-service')

module.exports = defineConfig({

	publicPath: './',
	productionSourceMap: process.env.NODE_ENV != 'production',

	transpileDependencies: [
		'vuetify'
	],

	devServer: {
		https: false,
		host: 'localhost'
	},

	filenameHashing: false,

	configureWebpack: {
		optimization:{
			splitChunks: false
		},
		output:{
			filename: '[name].js'
		},
		plugins: [
			// -- BUILD VERSION STUFF ------------------
			new webpack.EnvironmentPlugin({'BUILD_DATE': buildDate}),
			new webpack.EnvironmentPlugin({'GIT_COMMIT_HASH': gitCommitHash}),
			new webpack.EnvironmentPlugin({'GIT_CURRENT_BRANCH': gitCurrentBranch}),
			new webpack.EnvironmentPlugin({'GIT_WORKING_COPY_STATUS': gitWorkingCopyStatus})
			// -- END BUILD VERSION STUFF ------------------
		  ]
	
	},
	css: {
		extract:{
			  filename: '[name].css'
		}
	}
})
