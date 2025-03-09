import { useEffect, useState } from 'react'
import { Edit, Plus, Repeat, Settings } from 'react-feather'
import { Alert } from '../components/Alert/Alert'
import { Card, CardHeader } from '../components/Card/Card'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useModalContext } from '../contexts/ModalContext'
import { Button } from '../components/Button/Button'
import { useApi } from '../contexts/ApiContext'
import { HeaderDataProps } from '../components/Card/types'
import { TasksSettings, TaskType, TodoGroup } from '../components/Task/types'
import { Task } from '../components/Task/Task'
import { useTranslation } from '../contexts/TranslationContext'

export const Todos = () => {
	const { dashboardId } = useParams()

	const [todoGroups, setTodoGroups] = useState<TodoGroup[]>([])
	const [tasks, setTasks] = useState<TaskType[] | null>(null)
	const [archivedTasks, setArchivedTasks] = useState<TaskType[] | null>(null)
	const [tasksSettings, setTasksSettings] = useState<TasksSettings | null>(null)
	const [activeGroup, setActiveGroup] = useState('')
	const [showArchive, setShowArchive] = useState(false)
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

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
		const url = `${API_URL}dashboards/${dashboardId}/tasks-settings`
		const response = await fetchData<TasksSettings>(url)

		if (response.error) {
			console.error('Failed to fetch TasksSettings', response.status, response.error)
			return
		}

		if (response.data) {
			setTasksSettings(response.data)
		}
	}

	const fetchTodoGroups = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/tasks-groups`
		const response = await fetchData<TodoGroup[]>(url)

		if (response.error) {
			console.error('Failed to fetch dashboard tasks group', response.status, response.error)
			setTodoGroups([])
			return
		}

		if (response.data) {
			setTodoGroups(response.data)
		}
	}

	const fetchTasks = async (id: string) => {
		if (!tasksSettings) {
			return
		}

		const url = `${API_URL}dashboards/${dashboardId}/tasks/${id}?sortBy=${tasksSettings.sortMethod}&order=${tasksSettings.sortDirection}`
		const response = await fetchData<TodoGroup>(url)

		setActiveGroup(id)

		if (response.error) {
			console.error('Failed to fetch tasks', response.status, response.error)
			return
		}

		if (response.data) {
			const data: TodoGroup = response.data
			const now = new Date()
			const activeTasks = data.tasks.filter(t => !t.archived_at || new Date(t.archived_at) > now)
			const archiveTasks = data.tasks.filter(t => t.archived_at && new Date(t.archived_at) <= now)
			setTasks(activeTasks)
			setArchivedTasks(archiveTasks)
		}
	}

	const addGroup = async (name: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/add-todo-group`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, tasks: [] }),
		}

		const response = await fetchData<TodoGroup>(url, options)

		if (response.error) {
			console.error('Failed to add todo group', response.status, response.error)
			return
		}

		if (response.data) {
			const data: TodoGroup = response.data
			setTodoGroups(prevGroups => [...(prevGroups ?? []), data])
		}
	}

	const handleSetTasksSettings = async (settings: TasksSettings) => {
		const url = `${API_URL}dashboards/${dashboardId}/tasks-settings`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(settings),
		}

		const response = await fetchData<TasksSettings>(url, options)

		if (response.error) {
			console.error('Failed to update task settings', response.status, response.error)
			return
		}

		if (response.data) {
			setTasksSettings(response.data)
		}
	}

	const handleModifyTodoGroupCategory = () => {
		const modifyTodoGroupCategoryModal = {
			name: 'modifyTodoGroup',
			data: {
				action: addGroup,
				actionName: t('add_group'),
				fetchAction: fetchTodoGroups,
				groups: todoGroups,
			},
			title: t('modify_todo_groups'),
		}
		setActiveModal(modifyTodoGroupCategoryModal)
	}

	const headerActions = () => {
		const actionsArray: HeaderDataProps[] = [
			{
				action: () => setShowArchive(prevState => !prevState),
				icon: <Repeat size={16} />,
				label: showArchive ? t('show_active_tasks') : t('show_archive_tasks'),
				btnVariant: 'light',
			},
		]
		if (tasksSettings) {
			const tasksSettingsModal = {
				name: 'tasksSettings',
				data: {
					action: handleSetTasksSettings,
					actionName: t('save_settings'),
					initValue: tasksSettings as TasksSettings,
				},
				title: t('tasks_settings'),
			}

			actionsArray.push({
				action: () => setActiveModal(tasksSettingsModal),
				icon: <Settings size={16} />,
				label: t('settings'),
				btnVariant: 'light',
			})
		}
		if (todoGroups && todoGroups.length > 0) {
			const addTaskModal = {
				name: 'addTask',
				data: {
					action: () => fetchTasks(activeGroup),
					actionName: t('save_task'),
					initValue: activeGroup,
					groups: todoGroups,
				},
				title: t('add_task'),
			}

			actionsArray.unshift({
				action: () => setActiveModal(addTaskModal),
				icon: <Plus size={16} />,
				label: t('add_task'),
				btnVariant: 'primary',
			})
		}
		return actionsArray
	}

	return (
		<Card
			className='card-p0'
			headerComponent={<CardHeader title={t('tasks_todo')} data={headerActions()}></CardHeader>}>
			<div className='card-subtitle border-top-0 flex-wrap'>
				<div className='d-flex gap-3 scroll-x-auto'>
					<Button
						variant='link'
						onClick={() => fetchTasks('')}
						className={`text-decoration-none scroll-item ${activeGroup === '' ? 'active' : ''}`}>
						{t('all_tasks')}
					</Button>
					{todoGroups &&
						todoGroups.length > 0 &&
						todoGroups.map(tdg => (
							<Button
								key={tdg._id}
								variant='link'
								className={`text-decoration-none scroll-item ${tdg._id === activeGroup ? 'active' : ''}`}
								onClick={() => fetchTasks(tdg._id)}>
								{tdg.name}
							</Button>
						))}
				</div>
				<Button variant='secondary' onClick={handleModifyTodoGroupCategory}>
					<Edit size={16} />
					{t('manage_groups')}
				</Button>
			</div>
			{showArchive && <div className='p-4 text-bold border-bottom border-light'>{t('archived_tasks')}</div>}
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
				<Alert variant='primary'>{`${t('list_of')} ${showArchive ? t('archived') : ''} ${t('tasks_is_empty')}.`}</Alert>
			)}
		</Card>
	)
}
