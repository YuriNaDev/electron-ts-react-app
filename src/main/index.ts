import { app, BrowserWindow } from 'electron'
import SQLite from 'better-sqlite3'

const db = SQLite('data.db')

// declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	// eslint-disable-line global-require
	app.quit()
}

const createWindow = (): void => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			// preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			nodeIntegration: true,
		},
	})

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

	// Open the DevTools.
	if (!app.isPackaged) {
		mainWindow.webContents.openDevTools()
	}

	// sqlite db test
	mainWindow.webContents.once('dom-ready', () => {
		const tableName = 'cats'
		const createTable = db.prepare(
			`CREATE TABLE IF NOT EXISTS ${tableName} (name CHAR(20), age INT)`
		)
		createTable.run()

		const insert = db.prepare(
			`INSERT INTO ${tableName} (name, age) VALUES (@name, @age)`
		)
		const insertMany = db.transaction((cats) => {
			for (const cat of cats) insert.run(cat)
		})

		const selectAllCats = db.prepare(`SELECT * FROM ${tableName}`)
		const rows = selectAllCats.all()

		if (!rows.length)
			insertMany([
				{ name: 'Joey', age: 2 },
				{ name: 'Sally', age: 4 },
				{ name: 'Junior', age: 1 },
			])

		rows.forEach((row) => {
			console.log(row)
		})
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
