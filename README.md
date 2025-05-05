# simple-api-for-fantasy-chars

Using node, express, chatgpt, zod, create a simple server with an endpoint to create Naruto characters from give names.

## 🏁 Features/objectives

1. an express server that will take query params: `url?names=fred,owen,john`
2. using chatgpt + zod, generate naruto character profiles for each name
3. return the data as an array of JSON objects

## 🖥️ Tech

1. node `v22.14`
2. express `v5.1`
3. chatgpt `v4.97`
4. zod `v3.24`

## 🚀 How to run

1. run server: `node server.js`
2. stop server: `ctrl C`
3. `curl "http://localhost:3000/naruto?names=Toby,Susaku,Rizen"`

## 📝 Notes

- don't forget your `.env` and `OPENAI_API_KEY`
- output a bit inconsistent, ie: Chūnin vs Chuunin, Fire Release vs Fire
- can be improved by providing a complete list to be chosen from
- bonus: feed all data back to get better background information
