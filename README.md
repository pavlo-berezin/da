## Startup

### Back-end

```bash
> cd back/
> npm install
> node run server.js
```

### Front-end

```bash
> cd front/
> yarn install
> yarn start
```

## Algorythm

- WebSocket connection is established when user opens web-app window. Each window has own unique connection.
- When user changes text of the input following steps are exectuted:
  1. With the help of the `diff` library following diff is getting prepared:
  ```json
  [{"count":13,"value":"Initial state"},{"count":1,"added":true,"value":"!"}]
  ```
  2. Payload with `diff` and `lastI` is sent to server. `lastI` is token of last change that client is aware of
  3. Server transforms diff into operations of adding/removing charachters of the state.
  4. Every operation is saved into operation log.
  5. If clients `lastI` doesn't match lates changes we will transform clients operation. We will go through all operations that was performed without awareness of client and correct the indexes to match what user tried to achieved (e.g. If three characters is added to start of the string and user wants to add character into the middle of the string we will add it to `originalIndex + 3` position). 
  6. Server sends updated text and `lastI` to all connected clients. 