import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { updateTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import CreateTodo from './components/todo/create';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import awsExports from "./aws-exports";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  }
}));

Amplify.configure(awsExports);

const App = () => {

  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      console.log(todos);
      setTodos(todos)
    } catch (err) {
      console.log('error fetching todos')
    }
  }

  async function toggleComplete(event, todo) {

    const updatedTodo = {
      id: todo.id,
      status: !todo.status
    }

    try {
      await API.graphql(graphqlOperation(updateTodo, {input: updatedTodo}))
          .then((response) => {
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

  const classes = useStyles();

  return (
      <div style={styles.container}>
        <h2>React Learning Todos</h2>

        <CreateTodo addedTodo={ todo => {setTodos([...todos, todo])} }></CreateTodo>
        <div className={classes.root}>
          {todos.map((todo, index) => (
              <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id={todo.id ? todo.id : index}
                    display="flex" flexDirection="column"
                >
                  <Typography className={classes.heading}>{todo.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <a href={todo.url}><p>{todo.url}</p></a>
                  <Typography>
                    {todo.description}
                  </Typography>
                  <FormControlLabel
                      control={<Switch checked={todo.status} onChange={(event) => {
                        toggleComplete(event, todo);
                      }}/>}
                      label="Completed"
                  />

                </AccordionDetails>
              </Accordion>
          ))
          }
        </div>
      </div>
  );
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
