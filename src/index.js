const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers || request.body;

  if (!username) {
    return response.status(409).json({error: `O campo username é obrigatório.`});
  } else if (findUser(username)) {
    next();
  } else {
    return response.status(409).json({error: `Nenhum usuário ${username} encontrado`});
  }
}

function checksExistsTodo(request, response, next) {
  const {username} = request.headers,
  {id} = request.params;

  if (!username || !id) {
    return response.status(409).json({error: `O campo username é obrigatório.`});
  } else if (findTodo(username, {id})) {
    next();
  } else {
    return response.status(404).json({error: `Nenhum todo ${id} encontrado`});
  }
}

function addUser(name, username) {
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return newUser;
}

function findUser(username) {
  return users.find(user => user.username === username);
}

function findTodo(username, data) {
  let findTodo = false;

  users.filter(user => {
    if (user.username === username)
      user.todos = user.todos.filter(todo => {
        if (todo.id == data.id) {
          findTodo = todo;
        }

        return todo;
      });

    return user;
  });

  return findTodo;
}

function addUserTodos(username, data) {
  let newTodo = {};

  users = users.filter(user => {
    if (user.username === username) {
      newTodo = {
        id: uuidv4(),
        title: data.title,
        done: false,
        deadline: new Date(data.deadline),
        created_at: new Date()
      };

      user.todos.push(newTodo);
    }

    return user;
  });

  return newTodo;
}

function updateUserTodos(username, data) {
  let newTodo = {};

  users = users.filter(user => {
    if (user.username === username)
      user.todos = user.todos.filter(todo => {
        if (todo.id == data.id) {
          todo.title = data.title;
          todo.deadline = new Date(data.deadline);
          newTodo = todo;
        }

        return todo;
      });

    return user;
  });

  return newTodo;
}

function markUserTodoAsDone(username, data) {
  let newTodo = {};

  users = users.filter(user => {
    if (user.username === username)
      user.todos = user.todos.filter(todo => {
        if (todo.id == data.id) {
          todo.done = true;
          newTodo = todo;
        }

        return todo;
      });

    return user;
  });

  return newTodo;
}

function deleteUserTodo(username, data) {
  users = users.filter(user => {
    if (user.username === username)
      user.todos = user.todos.filter(todo => todo.id != data.id);

    return user;
  });
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  if (!name || !username) {
    return response.status(409).json({msg: `O campo ${!name ? 'name' : 'username'} é obrigatório.`});
  } else if (findUser(username)) {
    return response.status(400).json({error: 'Mensagem do erro'});
  }

  return response.status(201).json(addUser(name, username));
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers || request.body;
  
  return response.status(200).json(findUser(username).todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers,
  {title, deadline} = request.body;
  
  return response.status(201).json(addUserTodos(username, {title, deadline}));
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {username} = request.headers,
  {title, deadline} = request.body,
  {id} = request.params;
  
  return response.status(200).json(updateUserTodos(username, {title, deadline, id}));
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {username} = request.headers,
  {id} = request.params;
  
  return response.status(200).json(markUserTodoAsDone(username, {id}));
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {username} = request.headers,
  {id} = request.params;
  
  deleteUserTodo(username, {id});

  return response.status(204).json({msg: 'Todo removido com sucesso.'});
});

module.exports = app;