import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { createTodo, updateTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import awsExports from "./aws-exports";

Amplify.configure(awsExports);

const initialState = { name: '', url: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      console.log(todos);
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.url) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function toggleComplete (event, todo) {

    const updatedTodo = {
      id : todo.id,
      status: !todo.status
    }

    try {
      await API.graphql(graphqlOperation(updateTodo, {input: updatedTodo}))
          .then( (response)=> {
            updateChanges(response);
          })
    } catch (err) {
      console.log('error creating todo:', err)
    }

    function updateChanges(response) {
      const {data: {updateTodo}} = response;
      let updatedTodos = todos.map(todo => [updateTodo].find(update => update.id === todo.id) || todo);
      setTodos(updatedTodos);
    }
  }

  return (
      <div style={styles.container}>
        <h2>React Learning Todos</h2>
        <input
            onChange={event => setInput('name', event.target.value)}
            style={styles.input}
            value={formState.name}
            placeholder="Title"
        />
        <input
            onChange={event => setInput('url', event.target.value)}
            style={styles.input}
            value={formState.url}
            placeholder="URL"
        />
        <Button variant="contained" color="primary" onClick={addTodo}>Create Todo</Button>
        {
          todos.map((todo, index) => (
              <div key={todo.id ? todo.id : index} style={styles.todo}>
                <a href={todo.url}><p style={styles.todoName}>{todo.url}</p></a>
                <FormControlLabel
                    control={<Switch checked={todo.status} onChange= {(event) => {
                      toggleComplete(event, todo);
                    }} />}
                    label="Completed"
                />
              </div>
          ))
        }
      </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App
