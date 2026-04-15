package tn.esprit.matchy_sub.Controllers;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.matchy_sub.entities.Plan;
import tn.esprit.matchy_sub.services.PlanImp;

import java.util.List;

@RestController
@RequestMapping("/plans")
@AllArgsConstructor
@CrossOrigin("*")
public class PlanController {
    public final PlanImp planService;

    // CREATE → utilise createPlan()
    @PostMapping
    public Plan create(@RequestBody Plan plan) {
        return planService.createPlan(plan);
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Plan getById(@PathVariable Long id) {
        return planService.findById(id);
    }

    // READ ALL
    @GetMapping
    public List<Plan> getAll() {
        return planService.findAll();
    }

    // UPDATE → utilise updateplan()
    @PutMapping("/{id}")
    public Plan update(@PathVariable Long id, @RequestBody Plan plan) {
        return planService.updateplan(id, plan);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        planService.deletePlan(id);
    }
}
