import { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Plus, Settings } from 'react-feather'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'
import { Card, CardHeader } from '../Card/Card'
import { Task } from '../Task/Task'

export const Todos = () => {
	const { dashboardId } = useParams()
	const token = localStorage.getItem('token')
	const [todoGroups, setTodoGroups] = useState(null)
	const [tasks, setTasks] = useState(null)
	const [activeGroup, setActiveGroup] = useState('')
	const [, setActiveModal] = useContext(ModalContext)

	useEffect(() => {
		fetchTodoGroups()
		fetchTasks('')
	}, [])

	const fetchTodoGroups = async () => {
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/tasks-groups`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (res.ok) {
			const data = await res.json()
			setTodoGroups(data.todoGroups)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const fetchTasks = async id => {
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/tasks/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		setActiveGroup(id)
		if (res.ok) {
			const data = await res.json()
			console.log(data.tasks)
			setTasks(data.tasks)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const addGroup = async name => {
		if (token && dashboardId && name) {
			const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/add-todo-group`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name,
					tasks: [],
				}),
			})
			if (res.ok) {
				const data = await res.json()
				await fetchTodoGroups()
				console.log(data)
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const modifyTodoGroupCategoryModal = {
		name: 'modifyTodoGroup',
		data: {
			action: addGroup,
			actionName: 'Add group',
			fetchAction: fetchTodoGroups,
			groups: todoGroups,
		},
		title: 'Modify todo group',
	}

	const addTaskModal = {
		name: 'addTask',
		data: {
			action: () => fetchTasks(activeGroup),
			actionName: 'Save task',
			initValue: activeGroup,
			groups: todoGroups,
		},
		title: 'Add task',
	}

	const headerActions = () => {
		const actionsArray = [
			{
				action: () => setActiveModal(addTaskModal),
				icon: <Plus size={16} />,
				label: 'Add task',
				btnClass: 'btn-primary',
			},
			{
				action: () => setActiveModal(modifyTodoGroupCategoryModal),
				icon: <Settings size={16} />,
				label: 'Manage groups',
				btnClass: 'btn-light',
			},
		]
		return actionsArray
	}

	return (
		<Card className='card-p0' headerComponent={<CardHeader title='Tasks to do' data={headerActions()}></CardHeader>}>
			<div className='card-subtitle border-top-0'>
				<div className='d-flex gap-3 scroll-x-auto'>
					<button onClick={() => fetchTasks('')} className={`btn btn-link link ${activeGroup === '' ? 'active' : ''}`}>
						All tasks
					</button>
					{todoGroups &&
						todoGroups.length > 0 &&
						todoGroups.map(tdg => (
							<button
								className={`btn btn-link link ${tdg._id === activeGroup ? 'active' : ''}`}
								onClick={() => fetchTasks(tdg._id)}>
								{tdg.name}
							</button>
						))}
				</div>
			</div>
			{tasks && tasks.length > 0 && (
				<div className='task-container rounded-bottom-4 overflow-hidden'>
					{tasks.map(t => (
						<Task task={t} fetchTasks={() => fetchTasks(activeGroup)} />
					))}
				</div>
			)}
		</Card>
	)
}
