export const FormRow = ({ label, content, className }) => {
	return (
		<div className={`form-row ${className ? className : ''}`}>
			<div className='form-row-label'>{label}</div>
			<div className='form-row-content'>{content}</div>
		</div>
	)
}
