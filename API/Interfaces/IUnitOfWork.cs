using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        // ITransactionRepository TransactionRepository {get;}
        // IVehicleRepository VehicleRepository {get;}
        // IPropRepository PropRepository {get;}
        Task<bool> Complete();
        bool HasChanges();
    }
}