import {
    FiCheck,
    FiX,
} from "react-icons/fi";

import "./Toast.scss";

const Toast = ({
    message,
    visible,
    onClose,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <div className="toast">
            <div className="toast__icon">
                <FiCheck />
            </div>

            <div className="toast__content">
                <strong>Success</strong>

                <span>
                    {message}
                </span>
            </div>

            <button
                type="button"
                className="toast__close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <FiX />
            </button>
        </div>
    );
};

export default Toast;