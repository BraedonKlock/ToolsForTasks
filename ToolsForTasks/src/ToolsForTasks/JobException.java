package ToolsForTasks;

public class JobException extends Exception {
	public  JobException(String message) {
		System.err.println("Exception: " + message);
	}
}