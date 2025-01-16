import { useEffect, useState } from 'react'
import { Edit, Plus, Repeat, Settings } from 'react-feather'
import { Alert } from '../Alert/Alert'
import { Card, CardHeader } from '../Card/Card'
import { Task, TasksSettings } from '../Task/Task'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'

export type TodoGroup = {
	_id: string
	name: string
	tasks: Task[]
}

export const Todos = () => {
	const { dashboardId } = useParams()
	const token = localStorage.getItem('token')
	const [todoGroups, setTodoGroups] = useState<TodoGroup[] | null>(null)
	const [tasks, setTasks] = useState<Task[] | null>(null)
	const [archivedTasks, setArchivedTasks] = useState<Task[] | null>(null)
	const [tasksSettings, setTasksSettings] = useState<TasksSettings | null>(null)
	const [activeGroup, setActiveGroup] = useState('')
	const [showArchive, setShowArchive] = useState(false)
	const { setActiveModal } = useModalContext()
	const visibleTasks = showArchive ? archivedTasks : tasks

	useEffect(() => {
		fetchTasksSettings()
	}, [])

	useEffect(() => {
		if (tasksSettings) {
			fetchTodoGroups()
			fetchTasks(activeGroup)
		}
	}, [tasksSettings])

	const fetchTasksSettings = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/tasks-settings`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (res.ok) {
			const data = await res.json()
			setTasksSettings(data)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const fetchTodoGroups = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/tasks-groups`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (res.ok) {
			const data = await res.json()
			setTodoGroups(data)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const fetchTasks = async (id: string) => {
		if (!tasksSettings) {
			return
		}

		const res = await fetch(
			`${API_URL}dashboards/${dashboardId}/tasks/${id}?sortBy=${tasksSettings.sortMethod}&order=${tasksSettings.sortDirection}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		setActiveGroup(id)
		if (res.ok) {
			const data = (await res.json()) as TodoGroup
			if (data) {
				const now = new Date()
				const activeTasks = data.tasks.filter(t => !t.archived_at || new Date(t.archived_at) > now)
				const archiveTasks = data.tasks.filter(t => t.archived_at && new Date(t.archived_at) < now)
				setTasks(activeTasks)
				setArchivedTasks(archiveTasks)
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const addGroup = async (name: string) => {
		if (token && dashboardId && name) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/add-todo-group`, {
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
				setTodoGroups(prevGroups => [...(prevGroups ?? []), data])
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

	const handleSetTasksSettings = async (settings: TasksSettings) => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/tasks-settings`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(settings),
		})
		if (res.ok) {
			const data = await res.json()
			setTasksSettings(data)
		} else {
			const error = await res.json()
			console.log(error.message)
		}
	}

	const tasksSettingsModal = {
		name: 'tasksSettings',
		data: {
			action: handleSetTasksSettings,
			actionName: 'Save settings',
			initValue: tasksSettings,
		},
		title: 'Tasks settings',
	}

	const headerActions = () => {
		const actionsArray = [
			{
				action: () => setShowArchive(prevState => !prevState),
				icon: <Repeat size={16} />,
				label: showArchive ? 'Show active tasks' : 'Show archive tasks',
				btnClass: 'btn-light',
			},
			{
				action: () => setActiveModal(tasksSettingsModal),
				icon: <Settings size={16} />,
				label: 'Settings',
				btnClass: 'btn-light',
			},
		]
		if (todoGroups && todoGroups.length > 0) {
			actionsArray.unshift({
				action: () => setActiveModal(addTaskModal),
				icon: <Plus size={16} />,
				label: 'Add task',
				btnClass: 'btn-primary',
			})
		}
		return actionsArray
	}

	return (
		<Card className='card-p0' headerComponent={<CardHeader title='Tasks to do' data={headerActions()}></CardHeader>}>
			<div className='card-subtitle border-top-0 flex-wrap'>
				<div className='d-flex gap-3 scroll-x-auto'>
					<button onClick={() => fetchTasks('')} className={`btn btn-link link ${activeGroup === '' ? 'active' : ''}`}>
						All tasks
					</button>
					{todoGroups &&
						todoGroups.length > 0 &&
						todoGroups.map(tdg => (
							<button
								key={tdg._id}
								className={`btn btn-link link ${tdg._id === activeGroup ? 'active' : ''}`}
								onClick={() => fetchTasks(tdg._id)}>
								{tdg.name}
							</button>
						))}
				</div>
				<button
					className='d-flex gap-2 align-center btn btn-light border'
					onClick={() => setActiveModal(modifyTodoGroupCategoryModal)}>
					<Edit size={16} />
					Manage groups
				</button>
			</div>
			{showArchive && <div className='p-4 text-bold border-bottom border-light'>Archived tasks</div>}
			{visibleTasks && visibleTasks.length > 0 ? (
				<>
					<div className='task-container rounded-bottom-4 overflow-hidden'>
						{tasksSettings &&
							visibleTasks.map(t => (
								<Task key={t._id} task={t} fetchTasks={() => fetchTasks(activeGroup)} tasksSettings={tasksSettings} />
							))}
					</div>
				</>
			) : (
				<Alert variant='primary'>{`The list of ${showArchive ? 'archived' : ''} tasks is empty.`}</Alert>
			)}
		</Card>
	)
}
