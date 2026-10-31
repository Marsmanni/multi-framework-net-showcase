using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaskStatus = UI_Sample_API.Models.TaskStatus;

namespace UI_Sample_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TaskListController : ControllerBase
    {
        // In-Memory-Speicher für Tasks während der Laufzeit
        private static readonly List<Models.Task> Tasks = new();
        private static int _nextId = 1;

        static TaskListController()
        {
            // Beispieldaten
            Tasks.AddRange(new []
            {
                new Models.Task
                {
                    Id = _nextId++,
                    Title = "Complete project documentation",
                    Description = "Write comprehensive API documentation",
                    DueDate = DateTime.Now.AddDays(7),
                    Status = TaskStatus.InProgress,
                    CreatedAt = DateTime.Now
                },
                new Models.Task
                {
                    Id = _nextId++,
                    Title = "Review pull requests",
                    Description = "Review and merge pending PRs",
                    DueDate = DateTime.Now.AddDays(2),
                    Status = TaskStatus.Open,
                    CreatedAt = DateTime.Now
                },
                new Models.Task
                {
                    Id = _nextId++,
                    Title = "Update dependencies",
                    Description = "Update all NuGet packages to latest versions",
                    DueDate = DateTime.Now.AddDays(14),
                    Status = TaskStatus.Completed,
                    CreatedAt = DateTime.Now.AddDays(-3)
                }
            });
        }

        /// <summary>
        /// Gibt alle Tasks zurück
        /// </summary>
        [HttpGet(Name = "GetAllTasks")]
        [ProducesResponseType(typeof(IEnumerable<Models.Task>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<Models.Task>> GetAll()
        {
            return Ok(Tasks);
        }

        /// <summary>
        /// Gibt einen einzelnen Task zurück
        /// </summary>
        [HttpGet("{id}", Name = "GetTaskById")]
        [ProducesResponseType(typeof(Models.Task), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<Models.Task> GetById(int id)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            return Ok(task);
        }

        /// <summary>
        /// Erstellt einen neuen Task
        /// </summary>
        [HttpPost(Name = "CreateTask")]
        [ProducesResponseType(typeof(Models.Task), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<Models.Task> Create([FromBody] Models.Task task)
        {
            if (string.IsNullOrWhiteSpace(task.Title))
            {
                return BadRequest(new { message = "Title is required" });
            }

            task.Id = _nextId++;
            task.CreatedAt = DateTime.Now;
            task.Status = TaskStatus.Open;

            Tasks.Add(task);

            return CreatedAtRoute("GetTaskById", new { id = task.Id }, task);
        }

        /// <summary>
        /// Aktualisiert einen vorhandenen Task
        /// </summary>
        [HttpPut("{id}", Name = "UpdateTask")]
        [ProducesResponseType(typeof(Models.Task), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<Models.Task> Update(int id, [FromBody] Models.Task updatedTask)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }

            if (string.IsNullOrWhiteSpace(updatedTask.Title))
            {
                return BadRequest(new { message = "Title is required" });
            }

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.DueDate = updatedTask.DueDate;
            task.Status = updatedTask.Status;

            return Ok(task);
        }

        /// <summary>
        /// Markiert einen Task als erledigt
        /// </summary>
        [HttpPatch("{id}/done", Name = "SetTaskDone")]
        [ProducesResponseType(typeof(Models.Task), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<Models.Task> SetDone(int id, [FromBody] bool done = true)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }

            task.Status = TaskStatus.Completed;
            return Ok(task);
        }

        /// <summary>
        /// Löscht einen Task
        /// </summary>
        [HttpDelete("{id}", Name = "DeleteTask")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Delete(int id)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }

            Tasks.Remove(task);
            return NoContent();
        }

        /// <summary>
        /// Löscht alle Tasks
        /// </summary>
        [HttpDelete(Name = "DeleteAllTasks")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public ActionResult DeleteAll()
        {
            Tasks.Clear();
            _nextId = 1;
            return NoContent();
        }

        /// <summary>
        /// Gibt nur erledigte Tasks zurück
        /// </summary>
        [HttpGet("done", Name = "GetDoneTasks")]
        [ProducesResponseType(typeof(IEnumerable<Models.Task>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<Models.Task>> GetDone()
        {
            return Ok(Tasks.Where(t => t.Status == TaskStatus.Completed));
        }

        /// <summary>
        /// Gibt nur nicht erledigte Tasks zurück
        /// </summary>
        [HttpGet("pending", Name = "GetPendingTasks")]
        [ProducesResponseType(typeof(IEnumerable<Models.Task>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<Models.Task>> GetPending()
        {
            return Ok(Tasks.Where(t => t.Status != TaskStatus.Completed));
        }
    }
}