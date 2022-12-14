const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found"});
  }

  request.user = user

  return next();
  
}


app.post('/users', (request, response) => {
 const { name, username } = request.body


const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error: "User already exists"});
  }

  const user = {
    name: name,
    username: username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;


  const createTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(createTodos)

  return response.status(201).json(createTodos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
 const {user} = request

 const {title, deadline} = request.body
 const {id} = request.params

 const todo = user.todos.find((todoId) => todoId.id === id)

 if(!todo) {
  return response.status(404).json({error:'todo id is not exist'})
 }

 todo.title = title;
 todo.deadline = deadline

 return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params
  const todo = user.todos.find((todoId) => todoId.id === id)

  if(!todo) {
    return response.status(404).json({error: "todo is not exist"})
  }
  todo.done = true;
  
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params
  const todoIndex = user.todos.findIndex(todoId => todoId.id === id)

  if (todoIndex === -1){
    return response.status(404).json({error: "todo is not exist"})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});


module.exports = app;