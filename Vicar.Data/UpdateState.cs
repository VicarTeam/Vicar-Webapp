namespace Vicar.Data;

/// <summary>
/// The <see cref="UpdateState"/> describes the current state of the data updating process.
/// </summary>
public enum UpdateState
{
    /// <summary>
    /// The data updater is in the loading phase and initializes all needed components.
    /// </summary>
    Loading,
    /// <summary>
    /// The data is being updated.
    /// </summary>
    Updating,
    /// <summary>
    /// The data has been updated and is currently finishing up the process.
    /// </summary>
    Finished
}