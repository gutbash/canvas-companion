const RoleDropdownMenu = ({ message, onClose }) => {

    const setAssistantRole = () => {
      message.role = "assistant";
      onClose();
    };

    const setUserRole = () => {
      message.role = "user";
      onClose();
    };

    return (
      <div className="role-dropdown-menu">
        <button onClick={setAssistantRole}>assistant</button>
        <button onClick={setUserRole}>user</button>
      </div>
    );
  };

  export default RoleDropdownMenu;