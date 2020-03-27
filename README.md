# MySQL to MongoDB data migration tool

A Node.js script to migrate MySQL data to MongoDB, mapping MySQL tables to MongoDB collections.

Supports migrations over network, use cases:
1. MySQL database hosted in GCP, to MongoDB hosted in Digital Ocean,
2. MySQL local database, to MongoDB Atlas,
3. MySQL database hosted in Linode, to local MongoDB instance,
4. And so much more ...

Will allow migrations from and to remote sites.

![mysql-mongo-etl](https://user-images.githubusercontent.com/17042186/50631158-694f8780-0f54-11e9-89b4-465fc98eb2dd.gif)

## Migrate your existing MySQL data into MongoDB

Open terminal/command promt and follow any of below methods.

Before you continue, ensure you have [Node.js](https://nodejs.org/download) installed in your system. See [here](https://nodejs.org/download) for more instructions. If you have it installed, you can continue below.

**Method I (For developers)**

1. Clone project
   > git clone https://github.com/dannysofftie/mysql-mongo-etl.git
2. Change working directory
   > cd mysql-mongo-etl
3. Install dependencies
   > npm install
4. Make it happen :wink:
   > npm run migrate

**Method II (This is for non-developers/non technical guys)**

1. Install package globally
   > npm install -g mysql-mongo-etl
2. Run command
   > mysql-mongo-etl

---

For both methods, you will be prompted to enter authentication credentials for your MySQL and MongoDB databases. Ensure you have access credentials that have read/write roles enabled, or else you will encounter errors.

---

Issues might occur if you don't have authentication set up in your MongoDB database, as read and write roles are required when inserting bulk data into MongoDB.

Follow below steps to enable authentication in your server:

> This set up is for Linux distros only. Check online for your operating system if not a linux distro.


- Login to your server and create a user for your database.
  > $ mongo
  ```bash
   mongo~$ use databaseName
   mongo~$ db.createUser({user: "username", pwd: "password", role: [{roles: "readWrite", db: "databaseName"}]})
  ```

  _Replace with your preferred credentials. You will use them to do migration in the other steps_

- Exit the mongo shell and restart mongod service.

- Uncomment the following code block at the bottom of `/etc/mongo.conf`, or add if not available.

  > sudo vi /etc/mongo.conf

  ```sh
     # security:
     #      authorization: enabled
  ```

- After enabling authentication and create a user with appropriate credentials, restart your mongo instance for this to take effect
  > sudo service restart mongo

---

You should be ready to migrate your data now. Follow **Method I** or **Method II** as above.

---

### Roadmap

- [x] Retrieve MySQL database models and data
- [x] Generate Mongoose schemas in Typescript
- [x] Dump MySQL data to MongoDB
- [x] Support migrations over the network
- [ ] Prevent duplicates in subsequent migrations

## LICENSE

MIT License

Copyright (c) 2018 - 2020 Danny Sofftie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
