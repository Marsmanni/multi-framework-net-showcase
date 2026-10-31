namespace UI_Sample_API.Models
{
    public class Task
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Open;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public enum TaskStatus
    {
        Open = 0,
        InProgress = 1,
        Completed = 2
    }
}